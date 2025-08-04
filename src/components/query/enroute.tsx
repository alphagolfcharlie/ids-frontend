import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { useLocation, useNavigate } from "react-router-dom"


export function EnrouteInput() {
  const [field, setField] = useState("")
  const [area, setArea] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enroutes, setEnroutes] = useState<any[]>([])
  const [searchField, setSearchField] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 3
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = enroutes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(enroutes.length / itemsPerPage)

  const navigate = useNavigate(); // Hook to update the URL
  const location = useLocation(); // Hook to get the current URL

  const fetchEnroutes = async (fieldToFetch: string, areaToFetch: string) => {
    setCurrentPage(1)
    if (!fieldToFetch) {
      setError("Field is required")
      return
    }

    setLoading(true)
    setError(null)
    setEnroutes([])

    const query = new URLSearchParams({ field: fieldToFetch })
    if (area) query.append("area", areaToFetch)

    try {
      const response = await fetch(`https://ids.alphagolfcharlie.dev/api/enroute?${query.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch enroute data")
      const data = await response.json()
      setEnroutes(data)
      setSearchField(fieldToFetch)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

    // Parse query parameters and populate form fields
    useEffect(() => {
      const params = new URLSearchParams(location.search); // Get query parameters from the URL
      const fieldParam = params.get("field"); // Extract "field" parameter
      const areaParam = params.get("area"); // Extract "area" parameter
  
      if (fieldParam) {
        setField(fieldParam); // Populate the field input
        setArea(areaParam || ""); // Populate the area input (if present)
        fetchEnroutes(fieldParam, areaParam || ""); // Fetch enroutes based on the query parameters
      }
    }, [location.search]); // Run this effect whenever the URL changes
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
  
      // Update the URL with the new query parameters
      const query = new URLSearchParams({ field });
      if (area) query.append("area", area);
      navigate(`?${query.toString()}`);
  
      // Fetch enroutes for the new field and area
      fetchEnroutes(field, area);
    };

  return (
    <div className="w-full max-w-sm space-y-4">
      <form onSubmit={handleSubmit}>
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

      {error && <p className="text-red-500">{error}</p>}

      {enroutes.length > 0 && (
        <div className="w-full border rounded p-4 bg-background">
          <h2 className="text-lg font-semibold mb-4">
            Enroute Info for {searchField}
          </h2>
          <ul className="space-y-4">
            {currentItems.map((entry, index) => (
              <li key={index} className="border-b pb-2">
                <p><strong>Field:</strong> {entry.field}</p>
                <p><strong>Qualifier:</strong> {entry.qualifier}</p>
                <p><strong>Areas:</strong> {entry.areas}</p>
                <p><strong>Rule:</strong> {entry.rule}</p>
              </li>
            ))}
          </ul>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {!loading && enroutes.length === 0 && searchField && (
        <p className="text-gray-500">No enroute data found for {searchField}.</p>
      )}
    </div>
  )
}
