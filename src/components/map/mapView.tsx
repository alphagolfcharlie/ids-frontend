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
  const [showSectors, setShowSectors] = useState(true)
  const sectorLayerRef = useRef<L.Layer | null>(null)
  const [showTracons, setShowTracons] = useState(true)



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
      fetch("/tracon.geojson").then(res => res.json()),      // TRACONs
      fetch("http://127.0.0.1:5000/api/controllers").then(res => res.json())
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
    
        // --- Combine all layers with correct draw order ---
        const sectorLayer = L.layerGroup([
          inactiveArtccLayer,
          inactiveTraconLayer,
          activeArtccLayer,
          activeTraconLayer
        ])
    
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
