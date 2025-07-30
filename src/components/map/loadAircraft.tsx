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

    fetch("https://ids.alphagolfcharlie.dev/api/aircraft")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch aircraft data")
        return res.json()
      })
      .then((data: Aircraft[]) => {
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
              color: circleColor,
              fillColor: "#30f",
              fillOpacity: 0.5,
              radius: 300,
            }).addTo(map)

            circle
              .bindTooltip(
                `${aircraft.callsign} ${aircraft.departure} ➔ ${aircraft.destination}`,
                {
                  sticky: true,
                  direction: "top",
                }
              )
              .bindPopup(`
                <div style="font-size: 16px; font-weight: bold;">
                  ${aircraft.callsign} ${aircraft.departure} ➔ ${aircraft.destination} - ${aircraft.altitude}
                </div>
                <div style="font-size: 13px; color: gray; margin-top: 5px; max-height: 100px; overflow-y: auto;">
                  ${aircraft.route}
                </div>
              `)
          }
        })
      })
      .catch((error) => {
        console.error("Error fetching aircraft data:", error)
      })
  }, [map])

  return null
}
