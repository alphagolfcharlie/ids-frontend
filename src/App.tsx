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
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"




export function InputWithLabel() {
  return (
    <div className="grid w-full max-w-sm items-center gap-3 mt-6">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />

    </div>
  )
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
  return (

    <div className="min-h-screen flex flex-col">
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Top nav */}
      <div className="p-4 border-b flex items-center justify-between">
  {/* Left side: Navigation Menu */}
  <NavigationMenu viewport={false}>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item Two</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link Two</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item Three</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link Three</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>

  {/* Right side: Mode Toggle */}
  <ModeToggle />
</div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>
          <p>Add to library</p>
          </TooltipContent>
        </Tooltip>
        <br></br>
        <Button>Click me</Button>
        <InputWithLabel />
        <br></br>

      </div>
      </ThemeProvider>
    </div>
  )
}

export default App
