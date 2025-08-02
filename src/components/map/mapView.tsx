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
  const [showTraffic, setShowTraffic] = useState(true)   // Live traffic toggle 
  const [showSectors, setShowSectors] = useState(true)   // ARTCC toggle
  const [showTracons, setShowTracons] = useState(true)   // TRACON toggle

  const artccLayerRef = useRef<L.LayerGroup | null>(null)
  const traconLayerRef = useRef<L.LayerGroup | null>(null)

  // Helper to normalize IDs
  const normalize = (id: string | undefined) =>
    (id ?? "").replace(/^K/, "").trim().toUpperCase()

  // Function to fetch & update sector layers
  function loadSectors() {
    const map = mapRef.current
    if (!map) return

    Promise.all([
      fetch("/boundaries.geojson").then(res => res.json()),   // ARTCCs
      fetch("/tracon.geojson").then(res => res.json()),       // TRACONs
      fetch("https://ids.alphagolfcharlie.dev/api/controllers").then(res => res.json())
    ])
      .then(([artccGeo, traconGeo, controllerData]: [FeatureCollection, FeatureCollection, any]) => {
        // Determine active ARTCCs and TRACONs
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

        const newArtccLayer = L.layerGroup([inactiveArtccLayer, activeArtccLayer])

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

        const newTraconLayer = L.layerGroup([inactiveTraconLayer, activeTraconLayer])

        // Remove old layers if exist
        if (artccLayerRef.current) {
          map.removeLayer(artccLayerRef.current)
        }
        if (traconLayerRef.current) {
          map.removeLayer(traconLayerRef.current)
        }

        artccLayerRef.current = newArtccLayer
        traconLayerRef.current = newTraconLayer

        // Add layers if toggled on
        if (showSectors) newArtccLayer.addTo(map)
        if (showTracons) newTraconLayer.addTo(map)
      })
      .catch(console.error)
  }

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

    // Initial load
    loadSectors()
    setMapReady(true)

    // Set interval to update every 60 seconds
    const intervalId = setInterval(() => {
      loadSectors()
    }, 60 * 1000)

    return () => {
      clearInterval(intervalId)
      map.remove()
    }
  }, [])

  // Update tile layer on theme change
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
              ARTCCs
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showTracons}
              onCheckedChange={setShowTracons}
            >
              ZOB TRACONs
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div id="map" className="h-[700px] w-full rounded-lg" />

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
