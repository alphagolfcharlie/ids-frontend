import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider" // adjust path as needed
import L from "leaflet"
import { ShowRoutes } from "./disproutes"
import "leaflet/dist/leaflet.css"
import { LoadAircraft } from "./loadAircraft"


export function MapView() {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const map = L.map("map").setView([41.4117, -81.8498], 7)
    mapRef.current = map

    const tileLayer = L.tileLayer(getTileUrl(theme), {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    })

    tileLayer.addTo(map)
    tileLayerRef.current = tileLayer
    setMapReady(true)

    return () => {
      map.remove()
    }
  }, [])

  // Update tile layer when theme changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(theme))
    }
  }, [theme])

  return (
    <div className="relative z-0">
    <div
      id="map"
      style={{ height: "700px", width: "100%", borderRadius: "10px" }}
    />
    {mapReady && mapRef.current && (
      <>
        <LoadAircraft map={mapRef.current} />
        <div className="mt-6">
          <ShowRoutes map={mapRef.current} />
        </div>
      </>
    )}
  </div>
  )
}

function getTileUrl(theme: string | undefined) {
  return theme === "light"
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
}
