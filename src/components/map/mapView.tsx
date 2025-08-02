import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import L from "leaflet"
import { ShowRoutes } from "./disproutes"
import "leaflet/dist/leaflet.css"
import { LoadAircraft } from "./loadAircraft"
import type { FeatureCollection } from "geojson"
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
  const [showSectors, setShowSectors] = useState(true)   // ARTCC toggle
  const [showTracons, setShowTracons] = useState(false)   // TRACON toggle

  const artccLayerRef = useRef<L.LayerGroup | null>(null)
  const traconLayerRef = useRef<L.LayerGroup | null>(null)

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

    Promise.all([
      fetch("/boundaries.geojson").then(res => res.json()),   // ARTCCs
      fetch("/tracon.geojson").then(res => res.json()),       // TRACONs
      fetch("https://ids.alphagolfcharlie.dev/api/controllers").then(res => res.json())
    ])
      .then(([artccGeo, traconGeo, controllerData]: [FeatureCollection, FeatureCollection, any]) => {
        const normalize = (id: string | undefined) =>
          (id ?? "").replace(/^K/, "").trim().toUpperCase()

        const activeArtccs = new Set(
          controllerData.controllers
            .filter((ctrl: any) => ctrl.isActive && !ctrl.isObserver)
            .map((ctrl: any) => normalize(ctrl.artccId))
        )

        const activeTracons = new Set(
          controllerData.tracon
            .filter((ctrl: any) => ctrl.isActive && !ctrl.isObserver)
            .map((ctrl: any) => normalize(ctrl.primaryFacilityId))
        )

        // --- ARTCCs ---
        const artccFeatures = artccGeo.features
        const artccActive = artccFeatures.filter(f => activeArtccs.has(normalize(f.properties?.id)))
        const artccInactive = artccFeatures.filter(f => !activeArtccs.has(normalize(f.properties?.id)))

        const inactiveArtccLayer = L.geoJSON(artccInactive, {
          style: {
            color: "#808080",
            weight: 1,
            fillOpacity: 0.1
          }
        })

        const activeArtccLayer = L.geoJSON(artccActive, {
          style: {
            color: "#00cc44",
            weight: 1,
            fillOpacity: 0.2
          }
        })

        artccLayerRef.current = L.layerGroup([inactiveArtccLayer, activeArtccLayer])

        // --- TRACONs ---
        const traconFeatures = traconGeo.features
        const traconActive = traconFeatures.filter(f => activeTracons.has(normalize(f.properties?.id)))
        const traconInactive = traconFeatures.filter(f => !activeTracons.has(normalize(f.properties?.id)))

        const inactiveTraconLayer = L.geoJSON(traconInactive, {
          style: {
            color: "#808080",
            weight: 1,
            fillOpacity: 0.1
          }
        })

        const activeTraconLayer = L.geoJSON(traconActive, {
          style: {
            color: "#00cc44",
            weight: 1,
            fillOpacity: 0.2
          }
        })

        traconLayerRef.current = L.layerGroup([inactiveTraconLayer, activeTraconLayer])

        // Add initial layers based on toggles
        if (showSectors) artccLayerRef.current.addTo(map)
        if (showTracons) traconLayerRef.current.addTo(map)
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

  // Toggle ARTCC layer visibility
  useEffect(() => {
    const map = mapRef.current
    const artccLayer = artccLayerRef.current

    if (map && artccLayer) {
      if (showSectors) {
        artccLayer.addTo(map)
      } else {
        map.removeLayer(artccLayer)
      }
    }
  }, [showSectors])

  // Toggle TRACON layer visibility
  useEffect(() => {
    const map = mapRef.current
    const traconLayer = traconLayerRef.current

    if (map && traconLayer) {
      if (showTracons) {
        traconLayer.addTo(map)
      } else {
        map.removeLayer(traconLayer)
      }
    }
  }, [showTracons])

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
              Sectors (ARTCC)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showTracons}
              onCheckedChange={setShowTracons}
            >
              TRACONs
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
