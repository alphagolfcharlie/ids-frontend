import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"


export function EnrouteInput() {
  const [field, setField] = useState("")
  const [area, setArea] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enroutes, setEnroutes] = useState<any[]>([])
  const [searchField, setSearchField] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchEnroutes = async () => {
    if (!field) {
      setError("Field is required")
      return
    }

    setLoading(true)
    setError(null)
    setEnroutes([])

    const query = new URLSearchParams({ field })
    if (area) query.append("area", area)

    try {
      const response = await fetch(`https://ids.alphagolfcharlie.dev/api/enroute?${query.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch enroute data")
      const data = await response.json()
      setEnroutes(data)
      setSearchField(field)
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
          fetchEnroutes()
        }}
      >
        <Label htmlFor="field">Field</Label>
        <Input
          id="field"
          type="text"
          placeholder="e.g. BUF"
          value={field}
          onChange={(e) => setField(e.target.value.toUpperCase())}
          className="mt-2"
          required
        />

        <Label htmlFor="area" className="mt-4">Area (optional)</Label>
        <Input
          id="area"
          type="text"
          placeholder="e.g. 7"
          value={area}
          onChange={(e) => setArea(e.target.value.trim())}
          className="mt-2"
        />

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={loading || !field}
        >
          {loading ? "Loading..." : "Get Enroute Info"}
        </Button>
      </form>

      <br></br>

      {error && <p className="text-red-500">{error}</p>}

      {enroutes.length > 0 && (
        <div className="w-full border rounded p-4 bg-background">
          <h2 className="text-lg font-semibold mb-4">
            Enroute Info for {searchField}
          </h2>
          <ul className="space-y-4">
            {enroutes.map((entry, index) => (
              <li key={index} className="border-b pb-2">
                <p><strong>Field:</strong> {entry.field}</p>
                <p><strong>Qualifier:</strong> {entry.qualifier}</p>
                <p><strong>Areas:</strong> {entry.areas}</p>
                <p><strong>Rule:</strong> {entry.rule}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && enroutes.length === 0 && searchField && (
        <p className="text-gray-500">No enroute data found for {searchField}.</p>
      )}
    </div>
  )
}
