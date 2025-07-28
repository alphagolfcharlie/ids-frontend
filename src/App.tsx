import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

import { Progress } from "@/components/ui/progress"

import React, { useState } from "react"


import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Textarea } from "@/components/ui/textarea"



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
  const [destination, setDestination] = useState("")
  const [crossings, setCrossings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCrossings = async () => {
    setLoading(true)
    setError(null)
    setCrossings([])

    try {
      const response = await fetch(`https://ids.alphagolfcharlie.dev/api/crossings?destination=${destination}`)
      if (!response.ok) throw new Error("Failed to fetch crossings")
      const data = await response.json()
      setCrossings(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="p-4 border-b flex items-center justify-between">
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start p-10 gap-6">
          <div className="w-full max-w-sm">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              type="text"
              placeholder="e.g. JFK"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="mt-2"
            />
            <Button onClick={fetchCrossings} className="mt-4 w-full" disabled={loading || !destination}>
              {loading ? "Loading..." : "Get Crossings"}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {crossings.length > 0 && (
            <div className="w-full max-w-2xl border rounded p-4 bg-background">
              <h2 className="text-lg font-semibold mb-4">Crossings for {destination}</h2>
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
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App