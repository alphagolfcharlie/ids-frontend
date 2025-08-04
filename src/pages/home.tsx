
import { AirportStatusCards } from "@/components/cards/statusCards"

import { ThemeProvider } from "@/components/theme-provider"

import { MapView } from "@/components/map/mapView"
import { Navbar } from "@/components/ui/navbar"

import { CrossingsInput } from "@/components/query/crossings"
import RoutesForm  from "@/components/query/routes"
import { EnrouteInput } from "@/components/query/enroute"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

export function HomePage() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const validTabs = ["routing", "crossings", "internalcrossings"]
  const activeTab = validTabs.includes(tab || "") ? tab! : "routing"

  const [currentTab, setCurrentTab] = useState(activeTab)

  useEffect(() => {
    if (!validTabs.includes(tab || "")) {
      navigate("/routing" + location.search, { replace: true })
    } else {
      setCurrentTab(tab!)
    }
  }, [tab, location.search, navigate])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-1/4 p-4 md:p-6 border-r overflow-y-auto space-y-10">
            <Tabs value={currentTab} onValueChange={(val) => {
              setCurrentTab(val)
              navigate("/" + val + location.search)
            }}>
              <TabsList>
                <TabsTrigger value="routing">Clearance Routing</TabsTrigger>
                <TabsTrigger value="crossings">External Crossings</TabsTrigger>
                <TabsTrigger value="internalcrossings">Internal LOAs</TabsTrigger>
              </TabsList>
              <br />
              <TabsContent value="routing">
                <RoutesForm />
              </TabsContent>
              <TabsContent value="crossings">
                <CrossingsInput />
              </TabsContent>
              <TabsContent value="internalcrossings">
                <EnrouteInput />
              </TabsContent>
            </Tabs>
          </div>

          <div className="w-full md:w-1/2 p-4 md:p-6 border-r">
            <AspectRatio ratio={16 / 9}>
              <MapView />
            </AspectRatio>
          </div>

          <div className="w-full md:w-1/4 border-r px-4 py-2 flex flex-col h-auto md:h-[calc(100vh-64px)] overflow-auto">
            <AirportStatusCards />
          </div>
        </div>

        <footer className="text-center text-sm text-gray-400 p-4 border-t">
          Site by Arya Chandrasekharan. This is not an official tool of the virtual Cleveland ARTCC, nor is it for real-world use. Always double-check information with relevant SOPs and LOAs.
        </footer>
      </div>
    </ThemeProvider>
  )
}