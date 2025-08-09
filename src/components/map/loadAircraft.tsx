import { useEffect } from "react"
import L from "leaflet"

type Aircraft = {
  altitude: number
  callsign: string
  departure: string
  destination: string
  lat: number
  lon: number
  route: string
}

const ZOB_AIRPORTS = ["KBUF", "KCLE", "KDTW", "KPIT"]

export function LoadAircraft({ map }: { map: L.Map | null }) {
  useEffect(() => {
    if (!map) return

    const aircraftLayerGroup = L.layerGroup([], { pane: "aircraftPane" }).addTo(map)

    const fetchAircraft = async () => {
      try {
        const res = await fetch("/api/aircraft")
        if (!res.ok) throw new Error("Failed to fetch aircraft data")

        const data: Aircraft[] = await res.json()

        // Clear existing aircraft markers
        aircraftLayerGroup.clearLayers()

        data.forEach((aircraft) => {
          if (aircraft.lat && aircraft.lon) {
            const isZobDeparture = ZOB_AIRPORTS.includes(aircraft.departure)
            const isZobArrival = ZOB_AIRPORTS.includes(aircraft.destination)

            let circleColor = "blue"
            if (isZobDeparture) {
              circleColor = "red"
            } else if (isZobArrival) {
              circleColor = "yellow"
            }

            const circle = L.circle([aircraft.lat, aircraft.lon], {
              pane: "aircraftPane", // <- important!
              color: circleColor,
              fillColor: "#30f",
              fillOpacity: 0.5,
              radius: 300,
            })

            circle
              .bindTooltip(
                `${aircraft.callsign} ${aircraft.departure} ➔ ${aircraft.destination}`,
                {
                  sticky: true,
                  direction: "top",
                  pane: "tooltipPane", // ensures it uses the tooltip pane
                }
              )
              .bindPopup(`
                <div style="font-size: 16px; font-weight: bold;">
                  ${aircraft.callsign} ${aircraft.departure} ➔ ${aircraft.destination} - ${aircraft.altitude}
                </div>
                <div style="font-size: 11px; color: gray; margin-top: 5px; max-height: 100px; overflow-y: auto;">
                  ${aircraft.route}
                </div>
              `)

            circle.addTo(aircraftLayerGroup)
          }
        })
      } catch (error) {
        console.error("Error fetching aircraft data:", error)
      }
    }

    fetchAircraft() // initial fetch
    const intervalId = setInterval(fetchAircraft, 60 * 1000) // every 1 minute

    return () => {
      clearInterval(intervalId)
      aircraftLayerGroup.clearLayers()
      map.removeLayer(aircraftLayerGroup)
    }
  }, [map])

  return null
}
