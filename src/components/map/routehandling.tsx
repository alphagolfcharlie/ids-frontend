import { useState } from "react"
import L from "leaflet"

type FixData = {
  lat: number
  lon: number
}

export type RouteData = {
  id: string
  name: string
  color: string
  layer: L.Polyline
  markers: L.CircleMarker[]
}

export function useRouteHandling(map: L.Map | null, updateList: () => void) {
  const [plottedRoutes, setPlottedRoutes] = useState<RouteData[]>([])

  const plotWaypoints = async (
    rawInput: string,
    color: string,
    statusDiv: HTMLDivElement
  ) => {
    if (!map) return

    let fixes = rawInput.trim().split(/\s+/).map(f => f.toUpperCase())
    fixes = await expandProcedure(fixes)
    fixes = fixes.filter(fix => /^[A-Z]{3,5}$/.test(fix))

    const missingFixes: string[] = []

    try {
      const res = await fetch(
        `/api/fix?fixes=${fixes.join(",")}`
      )
      const data: Record<string, FixData> = await res.json()

      const coords: L.LatLngExpression[] = []
      const markers: L.CircleMarker[] = []

      fixes.forEach(fix => {
        if (data[fix]) {
          const latlng: [number, number] = [data[fix].lat, data[fix].lon]
          coords.push(latlng)

          const marker = L.circleMarker(latlng, {
            radius: 6,
            color,
            fillColor: color,
            fillOpacity: 0.8
          })
            .addTo(map)
            .bindTooltip(fix, {
              permanent: false,
              direction: "right",
              opacity: 0.9
            })

          markers.push(marker)
        } else {
          missingFixes.push(fix)
        }
      })

      if (coords.length > 1) {
        const polyline = L.polyline(coords, {
          color,
          weight: 3,
          opacity: 0.8
        }).addTo(map)

        const newRoute: RouteData = {
          id: Date.now().toString(),
          name: rawInput.toUpperCase(),
          color,
          layer: polyline,
          markers
        }

        setPlottedRoutes(prev => [...prev, newRoute])
        updateList()
      }

      if (missingFixes.length > 0) {
        statusDiv.innerHTML = `⚠️ Missing fixes: <b>${missingFixes.join(", ")}</b>`
      } else {
        statusDiv.innerText = ""
      }
    } catch (err) {
      console.error("Error fetching fixes:", err)
      statusDiv.innerText = "An error occurred while fetching route data."
    }
  }

  const changeRouteColor = (id: string, newColor: string) => {
    setPlottedRoutes(prev =>
      prev.map(route => {
        if (route.id === id) {
          route.layer.setStyle({ color: newColor })
          route.markers.forEach(marker => {
            marker.setStyle({ color: newColor, fillColor: newColor })
          })
          return { ...route, color: newColor }
        }
        return route
      })
    )
    updateList()
  }

  const removeRoute = (id: string) => {
    setPlottedRoutes(prev => {
      const route = prev.find(r => r.id === id)
      if (route && map) {
        map.removeLayer(route.layer)
        route.markers.forEach(m => map.removeLayer(m))
      }
      return prev.filter(r => r.id !== id)
    })
    updateList()
  }

  return {
    plotWaypoints,
    changeRouteColor,
    removeRoute,
    plottedRoutes
  }
}

// Fix expansion logic for SID, STAR, airways
async function expandProcedure(fixes: string[]): Promise<string[]> {
  const expanded: string[] = []

  for (let i = 0; i < fixes.length; i++) {
    const current = fixes[i].toUpperCase()
    const isAirway = /^[A-Z]{1,3}\d{1,4}$/.test(current)
    const isProcedure = /^[A-Z]{5}\d{1,2}$/.test(current)

    // Handle SID
    if (isProcedure && i === 0 && fixes[i + 1]) {
      const sidTransition = fixes[i + 1].toUpperCase()
      const sidCode = `${current}.${sidTransition}`

      try {
        const res = await fetch(`/api/sid?code=${sidCode}`)
        const data = await res.json()
        expanded.push(...(data.waypoints || [current]))
      } catch {
        expanded.push(current, sidTransition)
      }

      i++
      continue
    }

    // Handle STAR
    if (isProcedure && i > 0) {
      const starTransition = fixes[i - 1].toUpperCase()
      const starCode = `${starTransition}.${current}`

      expanded.pop()
      try {
        const res = await fetch(`/api/star?code=${starCode}`)
        const data = await res.json()
        expanded.push(...(data.waypoints || [current]))
      } catch {
        expanded.push(current)
      }

      continue
    }

    // Handle airway
    if (isAirway && i > 0 && i < fixes.length - 1) {
      const prev = expanded[expanded.length - 1]
      const nextFix = fixes[i + 1]
      const next = /^[A-Z0-9]+\.[A-Z0-9]+$/.test(nextFix)
        ? nextFix.split(".")[0]
        : nextFix

      try {
        const res = await fetch(
          `/api/airway?id=${current}&from=${prev}&to=${next}`
        )
        const data = await res.json()

        if (data.segment) {
          expanded.pop()
          expanded.push(...data.segment.slice(0, -1))
          expanded.push(next)
        } else {
          expanded.push(current)
        }
      } catch {
        expanded.push(current)
      }

      i++
      continue
    }

    // Catch-all
    expanded.push(current)
  }

  return expanded
}
