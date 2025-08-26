import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // React Router for accessing the URL

const RoutesForm = () => {
  const [routeOrigin, setRouteOrigin] = useState("");
  const [routeDestination, setRouteDestination] = useState("");
  const [submittedRouteOrigin, setSubmittedRouteOrigin] = useState("");
  const [submittedRouteDestination, setSubmittedRouteDestination] = useState("");
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);

  const location = useLocation(); // Access the current URL
  const navigate = useNavigate(); // Hook to programmatically update the URL

  const isUrlUpdate = useRef(false); // Track if the update is from the URL

  const fetchRoutes = async () => {
    setRoutesLoading(true);
    setRoutesError(null);
    setRoutes([]);

    try {
      const response = await fetch(
        `https://api.alphagolfcharlie.dev/ids/routes?origin=${routeOrigin}&destination=${routeDestination}`
      );
      if (!response.ok) throw new Error("Failed to fetch routes");
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      setRoutesError((err as Error).message);
    } finally {
      setRoutesLoading(false);
    }
  };

  // Parse query parameters and populate form fields
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Get query parameters from the URL
    const dep = params.get("dep"); // Extract "dep" parameter
    const dest = params.get("dest"); // Extract "dest" parameter

    if (dep && dest) {
      isUrlUpdate.current = true; // Mark this as a URL-based update
      setRouteOrigin(dep.toUpperCase());
      setRouteDestination(dest.toUpperCase());
      setSubmittedRouteOrigin(dep.toUpperCase());
      setSubmittedRouteDestination(dest.toUpperCase());
    }
  }, [location.search]); // Run this effect whenever the URL changes

  // Trigger fetchRoutes only for URL-based updates
  useEffect(() => {
    if (isUrlUpdate.current && routeOrigin && routeDestination) {
      fetchRoutes();
      isUrlUpdate.current = false; // Reset the flag after fetching
    }
  }, [routeOrigin, routeDestination]); // Run this effect whenever routeOrigin or routeDestination changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the submitted values
    setSubmittedRouteOrigin(routeOrigin);
    setSubmittedRouteDestination(routeDestination);

    // Update the URL with the new query parameters
    navigate(`/routes?dep=${routeOrigin}&dest=${routeDestination}`);

    // Fetch routes for the new origin and destination
    fetchRoutes();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit}>
        <Label htmlFor="routeOrigin">Route Origin</Label>
        <Input
          id="routeOrigin"
          type="text"
          placeholder="e.g. DTW or KDTW"
          value={routeOrigin}
          onChange={(e) => {
            isUrlUpdate.current = false; // Ensure this is treated as user input
            setRouteOrigin(e.target.value.toUpperCase());
          }}
          className="mt-2"
        />

        <Label htmlFor="routeDestination" className="mt-4 block">
          Route Destination
        </Label>
        <Input
          id="routeDestination"
          type="text"
          placeholder="e.g. ORD or KORD"
          value={routeDestination}
          onChange={(e) => {
            isUrlUpdate.current = false; // Ensure this is treated as user input
            setRouteDestination(e.target.value.toUpperCase());
          }}          
          className="mt-2"
        />

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={routesLoading || !routeOrigin || !routeDestination}
        >
          {routesLoading ? "Loading..." : "Get Routes"}
        </Button>
      </form>

      {routesError && <p className="text-red-500">{routesError}</p>}

      {routes.length > 0 && (
        <div className="w-full border rounded p-4 bg-background">
          <h2 className="text-lg font-semibold mb-4">
            Routes from {submittedRouteOrigin} to {submittedRouteDestination}
          </h2>
          <ul className="space-y-4">
            {routes.map((route, index) => (
              <li key={index} className="border-b pb-2">
                <p><strong>Route:</strong> {route.route}</p>
                <p><strong>Altitude:</strong> {route.altitude || "N/A"}</p>
                <p><strong>Notes:</strong> {route.notes || "N/A"}</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {route.source === "faa" && (
                    <Badge variant="default" className="bg-cyan-900 text-white">
                      FAA Preferred Route
                    </Badge>
                  )}
                  {route.isEvent && (
                    <Badge variant="default" className="bg-fuchsia-500 text-white">
                      Event Route
                    </Badge>
                  )}
                  {route.isActive && route.hasFlows && (
                    <Badge variant="default" className="bg-green-700 text-white">
                      Route active for RW flow
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!routesLoading &&
        routes.length === 0 &&
        submittedRouteOrigin &&
        submittedRouteDestination && (
          <p className="text-gray-500">
            No routes found from {submittedRouteOrigin} to {submittedRouteDestination}.
          </p>
        )}
    </div>
  );
}

export default RoutesForm;