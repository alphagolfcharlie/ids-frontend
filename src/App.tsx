import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { AirportStatusCards } from "@/components/cards/statusCards"
import { Label } from "@/components/ui/label"


import { ThemeProvider } from "@/components/theme-provider"

import { Badge } from "@/components/ui/badge"


import { useState } from "react"

import { MapView } from "@/components/map/mapView"
import { Navbar } from "./components/ui/navbar"

  
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
          
        {/* Right Content Area */}
        <div className="w-1/4 p-6 border-r overflow-y-auto space-y-10">
          {/* Crossings Input */}
          <div className="w-full max-w-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDestination(inputValue);
                fetchCrossings(inputValue);
              }}
            >
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                type="text"
                placeholder="e.g. JFK"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                className="mt-2"
              />
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={loading || !inputValue}
              >
                {loading ? "Loading..." : "Get Crossings"}
              </Button>
            </form>
          </div>
  
          {error && <p className="text-red-500">{error}</p>}
  
          {crossings.length > 0 && (
            <div className="w-full max-w-sm border rounded p-4 bg-background">
            <h2 className="text-lg font-semibold mb-4">
                Crossings for {destination}
              </h2>
              <ul className="space-y-4">
                {crossings.map((crossing, index) => (
                  <li key={index} className="border-b pb-2">
                    <p><strong>Fix:</strong> {crossing.fix}</p>
                    <p><strong>Restriction:</strong> {crossing.restriction}</p>
                    <p><strong>Notes:</strong> {crossing.notes || "N/A"}</p>
                    <p><strong>ARTCC:</strong> {crossing.artcc}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
  
          {!loading && crossings.length === 0 && destination && (
            <p className="text-gray-500">No crossings found for {destination}.</p>
          )}
  
          {/* Routes Input */}
          <div className="w-full max-w-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmittedRouteOrigin(routeOrigin);
                setSubmittedRouteDestination(routeDestination);
                fetchRoutes();
              }}
            >
              <Label htmlFor="routeOrigin">Route Origin</Label>
              <Input
                id="routeOrigin"
                type="text"
                placeholder="e.g. DTW"
                value={routeOrigin}
                onChange={(e) => setRouteOrigin(e.target.value.toUpperCase())}
                className="mt-2"
              />
  
              <Label htmlFor="routeDestination" className="mt-4 block">
                Route Destination
              </Label>
              <Input
                id="routeDestination"
                type="text"
                placeholder="e.g. MSP"
                value={routeDestination}
                onChange={(e) => setRouteDestination(e.target.value.toUpperCase())}
                className="mt-2"
              />
  
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={routesLoading || !routeOrigin || !routeDestination}
              >
                {routesLoading ? "Loading..." : "Get Routes"}
              </Button>
            </form>
          </div>
  
          {routesError && <p className="text-red-500">{routesError}</p>}
  
          {routes.length > 0 && (
            <div className="w-full max-w-sm border rounded p-4 bg-background mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Routes from {submittedRouteOrigin} to {submittedRouteDestination}
              </h2>
              <ul className="space-y-4">
                {routes.map((route, index) => (
                  <li key={index} className="border-b pb-2">
                    <p><strong>Route:</strong> {route.route}</p>
                    <p><strong>Altitude:</strong> {route.altitude || "N/A"}</p>
                    <p><strong>Notes:</strong> {route.notes || "N/A"}</p>
  
                    <div className="flex flex-wrap gap-2 mt-2">
                      {route.source === "faa" && (
                        <Badge variant="default" className="bg-cyan-900 text-white">
                          FAA Preferred Route
                        </Badge>
                      )}
                      {route.isEvent && (
                        <Badge variant="default" className="bg-fuchsia-500 text-white">
                          Event Route
                        </Badge>
                      )}
                      {route.isActive && route.hasFlows && (
                        <Badge variant="default" className="bg-green-700 text-white">
                          Route active for RW flow
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
  
          {!routesLoading &&
            routes.length === 0 &&
            submittedRouteOrigin &&
            submittedRouteDestination && (
              <p className="text-gray-500">
                No routes found from {submittedRouteOrigin} to {submittedRouteDestination}.
              </p>
            )}
        </div>
        <div className="w-1/2 p-6">
        <MapView />
        </div>
      </div>
    </div>
  </ThemeProvider>
  
  )
}

export default App