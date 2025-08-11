import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
  } from "@/components/ui/navigation-menu";
  import { ModeToggle } from "./modeToggle";
  import { LoginDialog } from "./login";

  export function Navbar() {
    return (
      <div>
      <div className="p-4 border-b flex items-center justify-between z-10 bg-background sticky top-0">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Links</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="https://clevelandcenter.org/splits" target="_blank">
                  Splits
                </NavigationMenuLink>
                <NavigationMenuLink href="https://refs.clevelandcenter.org" target="_blank">
                  Refs
                </NavigationMenuLink>
                <NavigationMenuLink href="https://clevelandcenter.org/downloads" target="_blank">
                  SOP/LOA
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
  
        {/* Login Dialog */}
        <div className="flex items-center space-x-4">
          <LoginDialog />
    
          {/* Mode Toggle */}
          <ModeToggle />
        </div>
      </div>
        <div className="bg-red-700 text-white text-center py-2">
        NOTAM: Pilot/controller/ATIS/weather information currently updating only every 5 minutes. This is a known bug and a fix is in the works.</div>
      </div>

    );
  }