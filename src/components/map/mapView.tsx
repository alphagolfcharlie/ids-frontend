import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import L from "leaflet"
import { ShowRoutes } from "./disproutes"
import "leaflet/dist/leaflet.css"
import { LoadAircraft } from "./loadAircraft"
import type { FeatureCollection, GeoJsonObject } from "geojson"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function MapView() {
  const { theme } = useTheme()
  const mapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [showTraffic, setShowTraffic] = useState(true)
  const [showSectors, setShowSectors] = useState(true)
  const sectorLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    const map = L.map("map").setView([41.5346, -80.6708], 6)
    mapRef.current = map

    const tileLayer = L.tileLayer(getTileUrl(theme), {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    })

    tileLayer.addTo(map)
    tileLayerRef.current = tileLayer

    // Fetch both sector boundaries and live ARTCC controllers
    Promise.all([
      fetch("/boundaries.geojson").then(res => res.json()),
      fetch("https://ids.alphagolfcharlie.dev/api/controllers").then(res => res.json())
    ])
      .then(([geoData, controllerData]: [GeoJsonObject, any]) => {
        //const features = (geoData as FeatureCollection).features || []

        // Extract live ARTCC IDs (e.g., ["ZOA", "ZLA"])
        const activeArtccs = new Set(
          controllerData.controllers
            .map((ctrl: any) => ctrl.artccId)
            .filter(Boolean)
        )

        // Style function: green for active, blue for others
        const styleFn: L.StyleFunction = (feature) => {
          const id = feature?.properties?.id ?? ""
          const artcc = id.replace(/^K/, "") // KZOA -> ZOA
          const isActive = activeArtccs.has(artcc)
        
          return {
            color: isActive ? "#00cc44" : "#3388ff",
            weight: 1,
            fillOpacity: isActive ? 0.2: 0.1,
          }
        }

        const sectorLayer = L.geoJSON(geoData as FeatureCollection, {
          style: styleFn
        })

        sectorLayerRef.current = sectorLayer
        if (showSectors) sectorLayer.addTo(map)
      })
      .catch(console.error)

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

  // Add or remove sector layer when toggle changes
  useEffect(() => {
    const map = mapRef.current
    const sectorLayer = sectorLayerRef.current

    if (map && sectorLayer) {
      if (showSectors) {
        sectorLayer.addTo(map)
      } else {
        map.removeLayer(sectorLayer)
      }
    }
  }, [showSectors])

  return (
    <div className="relative z-0">
      <div className="absolute top-4 right-4 z-[1000]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Map Layers</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuCheckboxItem
              checked={showTraffic}
              onCheckedChange={setShowTraffic}
            >
              Live Traffic
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showSectors}
              onCheckedChange={setShowSectors}
            >
              Sectors
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        id="map"
        style={{ height: "700px", width: "100%", borderRadius: "10px" }}
      />

      {mapReady && mapRef.current && (
        <>
          {showTraffic && <LoadAircraft map={mapRef.current} />}
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
