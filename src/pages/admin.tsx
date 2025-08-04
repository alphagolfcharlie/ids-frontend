"use client";


import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/ui/navbar"; // Import your Navbar component

import { CrossingsTable } from "@/components/admin/crossingsTable";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnrouteTable } from "@/components/admin/enrouteTable";
import { RoutesTable } from "@/components/admin/routesTable";

export type Crossing = {
  _id: string;
  destination: string;
  bdry_fix: string;
  restriction: string;
  notes: string;
  artcc: string;
};

export function AdminPage() {
  return (
    <ThemeProvider>
      <Navbar />
      <div className="min-h-screen flex flex-col p-8">
      <div className="w-full p-4">      
      <Tabs defaultValue="routing" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="routing">Edit Routes</TabsTrigger>
              <TabsTrigger value="crossings">Edit External Crossings</TabsTrigger>
              <TabsTrigger value="internalcrossings">Edit Internal LOAs</TabsTrigger>
            </TabsList>
            <br></br>
            <TabsContent value="routing">
              <RoutesTable />
            </TabsContent>
            <TabsContent value="crossings">
              <CrossingsTable />
            </TabsContent>
            <TabsContent value="internalcrossings">
              <EnrouteTable />
            </TabsContent>
          </Tabs>
    </div>
    </div>
    </ThemeProvider>

  );
}