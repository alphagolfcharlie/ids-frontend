import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function CrossingsInput() {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [crossings, setCrossings] = useState<any[]>([])
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchCrossings = async (destinationToFetch: string) => {
    setLoading(true)
    setError(null)
    setCrossings([])

    try {
      const response = await fetch(`https://ids.alphagolfcharlie.dev/api/crossings?destination=${destinationToFetch}`)
      if (!response.ok) throw new Error("Failed to fetch crossings")
      const data = await response.json()
      setCrossings(data)
      setDestination(destinationToFetch)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          fetchCrossings(inputValue)
        }}
      >
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          type="text"
          placeholder="e.g. EWR"
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

      {error && <p className="text-red-500">{error}</p>}

      {crossings.length > 0 && (
        <div className="w-full border rounded p-4 bg-background">
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
    </div>
  )
}
