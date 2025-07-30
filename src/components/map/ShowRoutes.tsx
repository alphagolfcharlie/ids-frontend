import { useRef, useState } from "react"
import { useRouteHandling } from "./routehandling"
import L from "leaflet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type ShowRoutesProps = {
  map: L.Map | null
}

export function ShowRoutes({ map }: ShowRoutesProps) {
  const routeStatusRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [routeColor, setRouteColor] = useState("#00ffff")
  const [loading, setLoading] = useState(false)

  const updateList = () => {} // stub — or replace with real handler

  const {
    plotWaypoints,
    //changeRouteColor,
    //removeRoute,
    //plottedRoutes
  } = useRouteHandling(map, updateList)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!map || !inputValue.trim()) return

    setLoading(true)
    await plotWaypoints(inputValue, routeColor, routeStatusRef.current!)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Label htmlFor="waypointInput">Route</Label>
      <Input
        id="waypointInput"
        type="text"
        placeholder="e.g. HHOWE4 LNCON JHW Q82 PONCT JFUND2"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
      />

      <div className="flex items-center space-x-2">
        <Label htmlFor="routeColorPicker">Color</Label>
        <input
          id="routeColorPicker"
          type="color"
          value={routeColor}
          onChange={(e) => setRouteColor(e.target.value)}
          className="h-8 w-10 p-0 border rounded"
        />
        <Button type="submit"
        disabled={loading || inputValue.trim() === ""}
        >
        {loading ? "Loading..." : "Plot Route"}
        </Button>
      </div>

      <div
        ref={routeStatusRef}
        className="text-sm text-red-600 font-mono mt-1"
      />
    </form>
  )
}
