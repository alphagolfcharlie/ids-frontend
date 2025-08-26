import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ReadMore } from "@/components/cards/readMore"
import { Skeleton } from "../ui/skeleton"

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
          const res = await fetch("https://api.alphagolfcharlie.dev/ids/airport_info")
          const json = await res.json()
          if (isMounted) {
            setAirportData(json.airports)
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
      const intervalId = setInterval(fetchAirportInfo, 60 * 1000) // 1 minute
    
      return () => {
        isMounted = false
        clearInterval(intervalId)
      }
    }, [])
    
  
    if (loading) {
      return (
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )
    }    if (error) return <p className="text-red-500">{error}</p>
  
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
  