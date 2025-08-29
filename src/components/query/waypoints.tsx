import { useEffect, useState } from "react";
import waypoints from "./waypoints.json";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface AirportInfo {
    airports: {
        KDTW: {
            flow: "NORTH" | "SOUTH" | null;
        };
    };
}

export function WaypointsDisplay() {
    const [dtwFlow, setDtwFlow] = useState<"NORTH" | "SOUTH" | null>(null);

    // Fetch DTW flow on mount
    useEffect(() => {
        fetch("https://api.alphagolfcharlie.dev/ids/airport_info")
            .then((res) => res.json())
            .then((data: AirportInfo) => {
                setDtwFlow(data.airports.KDTW.flow);
            })
            .catch((err) => console.error("Failed to fetch airport info:", err));
    }, []);

    const allRunways: (keyof typeof waypoints.dtwrotg[0]["rotg"])[] = [
        "21R/L","22L","22R","03L","04R","03R","04L"
    ];

    // Exclude runways based on flow
    const excludeRunways = dtwFlow === "NORTH"
        ? ["21R/L","22L","22R"]
        : dtwFlow === "SOUTH"
            ? ["03L","04R","03R","04L"]
            : [];

    return (
        <div className="space-y-8 p-4">

            {/* Table 1: DTW ROTG */}
            <Card>
                <CardHeader>
                    <CardTitle>DTW ROTG / SIDs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SID</TableHead>
                                <TableHead>Gate</TableHead>
                                {allRunways
                                    .filter(rwy => !excludeRunways.includes(rwy))
                                    .map(rwy => <TableHead key={rwy}>{rwy}</TableHead>)
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {waypoints.dtwrotg.map((sid) => (
                                <TableRow key={sid.sid}>
                                    <TableCell><span className="font-bold">{sid.sid}</span></TableCell>
                                    <TableCell>{sid.gate}</TableCell>
                                    {allRunways
                                        .filter(rwy => !excludeRunways.includes(rwy))
                                        .map(rwy => (
                                            <TableCell
                                                key={rwy}
                                                className={sid.prefRwys.includes(rwy) ? "text-green-600" : "text-gray-400"}
                                            >
                                                {sid.rotg[rwy]}
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Table 2: DTW Metro Headings */}
            <Card>
                <CardHeader>
                    <CardTitle>DTW Metro / Headings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metro SID</TableHead>
                                {Object.keys(waypoints.metrosid[0].headings)
                                    .filter((key) => key !== "Gate")
                                    .map((gate) => <TableHead key={gate}>{gate}</TableHead>)
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {waypoints.metrosid.map((metro) => (
                                <TableRow key={metro.name}>
                                    <TableCell>{metro.name}</TableCell>
                                    {Object.entries(metro.headings)
                                        .filter(([key]) => key !== "Gate")
                                        .map(([_, heading]) => (
                                            <TableCell key={_}>{heading || "-"}</TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}