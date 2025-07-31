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
  const [, forceUpdate] = useState(0)

  const updateList = () => forceUpdate(n => n + 1)

  const {
    plotWaypoints,
    changeRouteColor,
    removeRoute,
    plottedRoutes
  } = useRouteHandling(map, updateList)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!map || !inputValue.trim()) return

    setLoading(true)
    await plotWaypoints(inputValue, routeColor, routeStatusRef.current!)
    setLoading(false)
    setInputValue("") // optional: clear after submit
  }

  return (
    <>
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
          <Button
            type="submit"
            disabled={loading || inputValue.trim() === ""}
          >
            {loading ? "Loading..." : "Plot Route"}
          </Button>
        </div>

        <div ref={routeStatusRef} className="text-gray-500" />
      </form>

      {plottedRoutes.length > 0 && (
        <div className="mt-6 space-y-4">
          <Label>Plotted Routes</Label>
          <ul className="space-y-2 mt-2">
            {plottedRoutes.map(route => (
              <li
                key={route.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex-1">
                  <p className="text-sm">{route.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={route.color}
                    onChange={(e) => changeRouteColor(route.id, e.target.value)}
                    className="h-6 w-8 border rounded"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeRoute(route.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
