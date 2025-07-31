import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    //NavigationMenuViewport,
  } from "@/components/ui/navigation-menu"
import { ModeToggle } from "./modeToggle"

export function Navbar() {
    return (

    <div className="p-4 border-b flex items-center justify-between z-10 bg-background sticky top-0">
    <NavigationMenu>
        <NavigationMenuList>
        <NavigationMenuItem>
            <NavigationMenuTrigger>External Links</NavigationMenuTrigger>
            <NavigationMenuContent>
            <NavigationMenuLink href="https://refs.clevelandcenter.org">Refs</NavigationMenuLink>
            <NavigationMenuLink href="https://clevelandcenter.org/downloads">SOPs/LOAs</NavigationMenuLink>
            </NavigationMenuContent>
        </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
    <ModeToggle />
    </div>
    );
}