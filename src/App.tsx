
import { AirportStatusCards } from "@/components/cards/statusCards"

import { ThemeProvider } from "@/components/theme-provider"

import { MapView } from "@/components/map/mapView"
import { Navbar } from "./components/ui/navbar"

import { CrossingsInput } from "./components/query/crossings"
import { RoutesInput } from "./components/query/routes"

  

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <Navbar />
    
        <div className="flex flex-1">

          <div className="w-1/4 border-r px-4 py-2 flex flex-col h-[calc(100vh-64px)]">
            <AirportStatusCards />
          </div>
            
          <div className="w-1/2 p-6 border-r">
          <MapView />
          </div>

          <div className="w-1/4 p-6 border-r overflow-y-auto space-y-10">
            <CrossingsInput />
            <RoutesInput />
          </div>

        </div>
      </div>
    </ThemeProvider>
  
  )
}

export default App