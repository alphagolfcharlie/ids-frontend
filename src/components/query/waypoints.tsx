import { useEffect, useState } from "react";
import waypoints from "./waypoints.json";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface AirportInfo {
    airports: {
        KDTW: { flow: "NORTH" | "SOUTH" | null };
        KPIT: { flow: "EAST" | "WEST" | null };
    };
}

export function WaypointsDisplay() {
    const [dtwFlow, setDtwFlow] = useState<"NORTH" | "SOUTH" | null>(null);
    const [pitFlow, setPitFlow] = useState<"EAST" | "WEST" | null>(null);

    useEffect(() => {
        fetch("https://api.alphagolfcharlie.dev/ids/airport_info")
            .then((res) => res.json())
            .then((data: AirportInfo) => {
                setDtwFlow(data.airports.KDTW.flow);
                setPitFlow(data.airports.KPIT.flow);
            })
            .catch((err) => console.error("Failed to fetch airport info:", err));
    }, []);

    // --- DTW ROTG runways ---
    const allRunways: (keyof typeof waypoints.dtwrotg[0]["rotg"])[] = [
        "21R/L", "22L", "22R", "03L", "03R", "04R", "04L"
    ];

    const dtwExclude = dtwFlow === "NORTH"
        ? ["21R/L", "22L", "22R"]
        : dtwFlow === "SOUTH"
            ? ["03L", "03R", "04L", "04R"]
            : [];

    // --- PIT runways filter ---
    const pitAllowed = ["Only one RWY in Use"]; // always include
    if (pitFlow === "EAST") {
        pitAllowed.push("10L", "10C", "10R");
    } else if (pitFlow === "WEST") {
        pitAllowed.push("28L", "28C", "28R");
    }

    return (
        <div className="p-4">
            <Accordion type="multiple" className="w-full space-y-4">

                {/* DTW ROTG */}
                <AccordionItem value="dtw-rotg">
                    <AccordionTrigger className="text-lg font-bold">DTW ROTG fixes / SID gates</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>SID</TableHead>
                                            <TableHead>Gate</TableHead>
                                            {allRunways
                                                .filter(rwy => !dtwExclude.includes(rwy))
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
                                                    .filter(rwy => !dtwExclude.includes(rwy))
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
                    </AccordionContent>
                </AccordionItem>

                {/* PIT Headings */}
                <AccordionItem value="pit-headings">
                    <AccordionTrigger className="text-lg font-bold">PIT Headings</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Runway</TableHead>
                                            <TableHead>Sector</TableHead>
                                            <TableHead>Heading</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {waypoints.pithdg
                                            .filter((rw) => pitAllowed.includes(rw.runway))
                                            .map((rw) =>
                                                Object.entries(rw.headings).map(([sector, heading]) => (
                                                    <TableRow key={`${rw.runway}-${sector}`}>
                                                        <TableCell>{rw.runway}</TableCell>
                                                        <TableCell>{sector}</TableCell>
                                                        <TableCell>{heading}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                {/* DTW Metro */}
                <AccordionItem value="dtw-metro">
                    <AccordionTrigger className="text-lg font-bold">DTW Metro SID Headings</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-4">
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
                                                    .map(([k, heading]) => (
                                                        <TableCell key={k}>{heading || "-"}</TableCell>
                                                    ))
                                                }
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>



            </Accordion>
        </div>
    );
}