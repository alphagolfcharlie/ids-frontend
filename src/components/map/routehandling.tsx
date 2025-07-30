import L from "leaflet"

type FixData = {
  lat: number
  lon: number
}

type RouteSegment = {
  polyline: L.Polyline
  markers: L.CircleMarker[]
  label: string
  color?: string
}

const plottedRoutes: RouteSegment[] = []

export function useRouteHandling(map: L.Map | null, updateList: () => void) {

  const changeRouteColor = (index: number, color: string) => {
    const route = plottedRoutes[index]
    if (!route) return

    route.polyline.setStyle({ color })
    route.markers.forEach(marker => {
      marker.setStyle({ color, fillColor: color })
    })
    route.color = color
  }

  const removeRoute = (index: number) => {
    const route = plottedRoutes[index]
    if (!route || !map) return

    map.removeLayer(route.polyline)
    route.markers.forEach(marker => map.removeLayer(marker))
    plottedRoutes.splice(index, 1)
    updateList()
  }

  const expandProcedure = async (fixes: string[]) => {
    const expanded: string[] = []

    for (let i = 0; i < fixes.length; i++) {
      const current = fixes[i].toUpperCase()
      const isAirway = /^[A-Z]{1,3}\d{1,4}$/i.test(current)
      const isSTAR = /^[A-Z0-9]+\.[A-Z0-9]+$/.test(current)
      const isSID = isSTAR && i === 0

      if (isSID) {
        const [transitionFix] = current.split(".")
        expanded.push(transitionFix)
        try {
          const res = await fetch(`https://ids.alphagolfcharlie.dev/api/sid?code=${current}`)
          const data = await res.json()
          expanded.push(...(data.waypoints || [current]))
        } catch {
          expanded.push(current)
        }
        continue
      }

      if (isSTAR) {
        const [transitionFix] = current.split(".")
        expanded.push(transitionFix)
        try {
          const res = await fetch(`https://ids.alphagolfcharlie.dev/api/star?code=${current}`)
          const data = await res.json()
          expanded.push(...(data.waypoints || [current]))
        } catch {
          expanded.push(current)
        }
        continue
      }

      if (isAirway && i > 0 && i < fixes.length - 1) {
        const prev = expanded[expanded.length - 1]
        const nextFix = fixes[i + 1]
        const next = /^[A-Z0-9]+\.[A-Z0-9]+$/.test(nextFix)
          ? nextFix.split(".")[0]
          : nextFix

        try {
          const res = await fetch(`https://ids.alphagolfcharlie.dev/api/airway?id=${current}&from=${prev}&to=${next}`)
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

      if (isAirway) {
        try {
          const res = await fetch(`/api/airway?id=${current}`)
          const data = await res.json()
          expanded.push(...(data.segment || [current]))
        } catch {
          expanded.push(current)
        }
        continue
      }

      expanded.push(current)
    }

    return expanded
  }

  const plotWaypoints = async (
    rawInput: string,                  // <-- fix here
    color: string,
    statusDiv: HTMLDivElement         // <-- fix here
  ) => {
    if (!map) return

    let fixes = rawInput.trim().split(/\s+/).map(f => f.toUpperCase())
    fixes = await expandProcedure(fixes)
    fixes = fixes.filter(fix => /^[A-Z]{3,5}$/.test(fix))

    statusDiv.innerText = "Loading route..."
    const missingFixes: string[] = []

    try {
      const res = await fetch(`https://ids.alphagolfcharlie.dev/api/fix?fixes=${fixes.join(",")}`)
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
          }).addTo(map).bindTooltip(fix, {
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
          color: color,
          weight: 3,
          opacity: 0.8
        }).addTo(map)

        plottedRoutes.push({
          polyline,
          markers,
          label: rawInput.toUpperCase(),
          color
        })
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

  return {
    plotWaypoints,
    changeRouteColor,
    removeRoute,
    plottedRoutes
  }
}
