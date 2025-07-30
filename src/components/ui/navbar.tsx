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
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuContent>
        </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
    <ModeToggle />
    </div>
    );
}