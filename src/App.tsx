import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AirportStatusCards } from "@/components/cards/statusCards"
import { Label } from "@/components/ui/label"


import { ThemeProvider } from "@/components/theme-provider"

import { Badge } from "@/components/ui/badge"


import { useState } from "react"

import { MapView } from "@/components/map/mapView"
import { Navbar } from "./components/ui/navbar"

import { CrossingsInput } from "./components/query/crossings"
import { RoutesInput } from "./components/query/routes"

  
export function LinkAsButton() {
  return (
    <Button asChild>
      <a href="https://refs.clevelandcenter.org" className="text-blue-500 hover:underline">Refs</a>
    </Button>
  )
}


function App() {
  const [crossings, setCrossings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("");
  const [destination, setDestination] = useState("");
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDestination, setRouteDestination] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [submittedRouteOrigin, setSubmittedRouteOrigin] = useState("");
  const [submittedRouteDestination, setSubmittedRouteDestination] = useState("");

  const fetchCrossings = async (destinationToFetch: string) => {
    setLoading(true)
    setError(null)
    setCrossings([])
  
    try {
      const response = await fetch(`https://ids.alphagolfcharlie.dev/api/crossings?destination=${destinationToFetch}`)
      if (!response.ok) throw new Error("Failed to fetch crossings")
      const data = await response.json()
      setCrossings(data)
      setDestination(destinationToFetch) // ✅ now it's updated *after* successful fetch
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    setRoutesLoading(true);
    setRoutesError(null);
    setRoutes([]);
  
    try {
      const response = await fetch(
        `https://ids.alphagolfcharlie.dev/api/routes?origin=${routeOrigin}&destination=${routeDestination}`
      );
      if (!response.ok) throw new Error("Failed to fetch routes");
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      setRoutesError((err as Error).message);
    } finally {
      setRoutesLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <Navbar />
  
      {/* Main Content Layout: Left (Airport Cards) and Right (Inputs/results) */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-1/4 border-r px-4 py-2 flex flex-col h-[calc(100vh-64px)]">
          <AirportStatusCards />
        </div>
          
        <div className="w-1/2 p-6 border-r">
        <MapView />
        </div>

        {/* Right Content Area */}
        <div className="w-1/4 p-6 border-r overflow-y-auto space-y-10">
          {/* Crossings Input */}
          <CrossingsInput />
  
          {/* Routes Input */}
          <RoutesInput />
        </div>

      </div>
    </div>
  </ThemeProvider>
  
  )
}

export default App