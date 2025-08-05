import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ReadMore } from "@/components/cards/readMore"

type AirportInfo = {
    icao: string
    metar: string
    atis: string
  }
  
type ApiResponse = {
    [icao: string]: AirportInfo
  }

export function AirportStatusCards() {
    const [airportData, setAirportData] = useState<ApiResponse>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      let isMounted = true
    
      async function fetchAirportInfo() {
        try {
          const res = await fetch("/api/airport_info")
          const json = await res.json()
          if (isMounted) {
            setAirportData(json)
            setError(null)
          }
        } catch (err) {
          if (isMounted) {
            setError("Failed to load airport data")
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }
    
      // Initial fetch
      fetchAirportInfo()
    
      // Polling interval every 5 minutes
      const intervalId = setInterval(fetchAirportInfo, 5 * 60 * 1000) // 300000ms
    
      return () => {
        isMounted = false
        clearInterval(intervalId)
      }
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
  