import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  //NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

import { ThemeProvider } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

import { Progress } from "@/components/ui/progress"

import React, { useEffect, useState } from "react"




import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Textarea } from "@/components/ui/textarea"


type AirportInfo = {
  icao: string
  metar: string
  atis: string
}


type ApiResponse = {
  [icao: string]: AirportInfo
}

function ReadMore({ text = "" }: { text?: string | null }) {
  const safeText = typeof text === "string" ? text : "";
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = safeText.length > 200;
  const displayText = expanded || !shouldTruncate
    ? safeText
    : safeText.slice(0, 200) + "...";

  return (
    <div>
      <p className="whitespace-pre-wrap">{displayText}</p>
      {shouldTruncate && (
        <button
          className="text-blue-500 text-sm mt-1 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
export function AirportStatusCards() {
  const [airportData, setAirportData] = useState<ApiResponse>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAirportInfo() {
      try {
        const res = await fetch("https://ids.alphagolfcharlie.dev/api/airport_info")
        const json = await res.json()
        setAirportData(json)
      } catch (err) {
        setError("Failed to load airport data")
      } finally {
        setLoading(false)
      }
    }

    fetchAirportInfo()
  }, [])

  if (loading) return <p>Loading airport data...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 min-h-0 pr-4">
        <div className="flex flex-col gap-4">
          {Object.entries(airportData).map(([icao, info]) => (
            <Card key={icao}>
              <CardHeader>
                <CardTitle>{icao}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>METAR:</strong>
                  <p className="break-words">{info.metar}</p>
                </div>
                <div>
                  <strong>ATIS:</strong>
                    <ReadMore text={info.atis} />
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export function ResizableDemo() {
  return (

      <ResizablePanelGroup
        direction="horizontal"
        className="w-[70%] rounded-lg border"
      >
      <ResizablePanel defaultSize={1000}>
        <div className="flex h-[400px] items-center justify-center p-12">
          <span className="font-semibold">One</span>
          <Textarea />
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={1000}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={500}>
            <div className="flex h-full items-center justify-center p-12">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={1500}>
            <div className="flex h-full items-center justify-center p-12">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

  
export function LinkAsButton() {
  return (
    <Button asChild>
      <a href="https://refs.clevelandcenter.org" className="text-blue-500 hover:underline">Refs</a>
    </Button>
  )
}


export function DepartureInput({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-3 mt-6">
      <Label htmlFor="departure">Departure</Label>
      <Input type="text" id="departure" placeholder="DTW" value={value} onChange={onChange} />
    </div>
  )
}

export function ArrivalInput({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-3 mt-6">
      <Label htmlFor="arrival">Destination</Label>
      <Input type="text" id="destination" placeholder="JFK" value={value} onChange={onChange} />
    </div>
  )
}

export function FlightInputs({
  departure,
  setDeparture,
  arrival,
  setArrival,
}: {
  departure: string
  setDeparture: (e: React.ChangeEvent<HTMLInputElement>) => void
  arrival: string
  setArrival: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex gap-4 max-w-md">
      <DepartureInput value={departure} onChange={setDeparture} />
      <ArrivalInput value={arrival} onChange={setArrival} />
    </div>
  )
}


export function ProgressDemo() {
  const [progress, setProgress] = React.useState(13)
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])
  return <Progress value={progress} className="w-[60%]" />
}

export function ModeToggle() {
  const { setTheme } = useTheme()
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      <div className="p-4 border-b flex items-center justify-between z-10 bg-background sticky top-0">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/">Home</NavigationMenuLink>
                <NavigationMenuLink href="/about">About</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ModeToggle />
      </div>
  
      {/* Main Content Layout: Left (Airport Cards) and Right (Inputs/results) */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-1/4 border-r px-4 py-2 flex flex-col h-[calc(100vh-64px)]">
          <AirportStatusCards />
        </div>
          
        {/* Right Content Area */}
        <div className="w-3/4 p-6 overflow-y-auto space-y-10">
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
      </div>
    </div>
  </ThemeProvider>
  
  )
}

export default App