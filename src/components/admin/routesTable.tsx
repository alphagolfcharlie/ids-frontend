import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { flexRender } from "@tanstack/react-table";
import { useEffect, useState } from "react";
"use client";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from "@/components/ui/dialog";

import { ThemeProvider } from "@/components/theme-provider";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"; // Use `import type` for type-only imports

import { Checkbox } from "@/components/ui/checkbox";


export type Route = {
    _id: string;
    origin: string;
    destination: string;
    route: string;
    altitude: string;
    notes: string; 
  };


  export function RoutesTable() {

    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [editingRoute, setEditingRoute] = useState<any | null>(null); // State for the crossing being edited
    const [editForm, setEditForm] = useState<any | null>(null); // State for the edit form data 
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog visibility

    // Fetch routes

    const fetchRoute = async () => {
        try {
        const response = await fetch("/api/routes", {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch routes");
        }

        const data = await response.json();
        setRoutes(data); // Update state with the fetched enroutes
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    // Delete a route
    const deleteRoute = async (id: string) => {
        const token = localStorage.getItem("authToken"); // Retrieve the JWT token

        if (!token) {
            alert("You are not authorized to perform this action.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this route?")) {
            return;
        }


        try {
            const response = await fetch(`/api/routes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
            });

            if (!response.ok) {
            throw new Error("Failed to delete route");
            }

            // Remove the deleted enroute from the state
            setRoutes((prevRoutes) => prevRoutes.filter((route) => route._id !== id));
            alert("Route deleted successfully.");
        } catch (err) {
            alert("Error deleting route: " + (err as Error).message);
        }
        };

    // Open the dialog for creating a new entry
    const handleCreateEntry = () => {
        setEditingRoute(null); // No enroute is being edited
        setEditForm({
        origin: "",
        destination: "",
        route: "",
        altitude: "",
        notes: "",
        }); // Initialize the form with default values
        setIsDialogOpen(true); // Open the dialog
    };

    const handleSaveEntry = (route: any) => {
        setEditingRoute(route); // Set the enroute being edited
        setEditForm({ ...route }); // Initialize the edit form with the enroute's current data
        setIsDialogOpen(true); // Open the edit modal
        };     

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
            alert("You are not authorized to perform this action. Please log in.");
            return;
            }
        
        
            const isEdit = editingRoute && editingRoute._id && editingRoute._id.trim() !== "";
            const url = isEdit
              ? `/api/routes/${editingRoute._id}`
              : `/api/routes`;
            const method = isEdit ? "PUT" : "POST";
    



    
            const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Include JWT token
            },
            body: JSON.stringify(editForm),
            });
        
            if (!response.ok) {
            throw new Error(`Failed to ${editingRoute ? "update" : "create"} route entry`);
            }
    
        
            //const updatedCrossing = await response.json();
        
            alert(`Enroute ${editingRoute ? "updated" : "created"} successfully!`);
            setIsDialogOpen(false); // Close the dialog

            // Re-fetch the enroutes to refresh the table
            await fetchRoute();
            } catch (err) {
            console.error(`Error ${editingRoute ? "updating" : "creating"} route:`, err);
            alert(`Failed to ${editingRoute ? "update" : "create"} route. Please try again.`);
            }
        };

    const handleCancelEdit = () => {
        setIsDialogOpen(false); // Close the dialog
    };

    useEffect(() => {
        fetchRoute();
    }, []);

    // Define columns for the DataTable
  const columns: ColumnDef<Route>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "origin",
      header: "Origin",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "route",
      header: "Route",
    },
    {
      accessorKey: "altitude",
      header: "Altitude",
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
              const route = row.original;
          
              return (
                <div className="flex gap-2 ml-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveEntry(route)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteRoute(route._id)}
                  >
                    Delete
                  </Button>
                </div>
              );
            },
          },
  ];

  const table = useReactTable({
    data: routes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

    

      {loading && <p>Loading route entries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && routes.length > 0 && (
        <>
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
            {/* Create Entry Button */}
            <Button onClick={handleCreateEntry}>
            Create New Entry
            </Button>

            {/* Filter Input */}
            <Input
            placeholder="Filter by origin..."
            value={(table.getColumn("origin")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("origin")?.setFilterValue(event.target.value)
            }
            className="w-64"
            />
            <Input 
            placeholder="Filter by destination..."
            value={(table.getColumn("destination")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("destination")?.setFilterValue(event.target.value)
            }
            className="w-64"
            />
        </div>

        {/* Columns Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between py-4 flex-wrap gap-4">
  {/* Left: Selected row info and rows per page */}
  <div className="flex items-center gap-6 text-sm text-muted-foreground">
    <div>
      {table.getFilteredSelectedRowModel().rows.length} of{" "}
      {table.getFilteredRowModel().rows.length} row(s) selected.
    </div>

    <div className="flex items-center gap-2">
      <span>Rows per page:</span>
      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(value) => table.setPageSize(Number(value))}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[10, 20, 30, 50].map((pageSize) => (
            <SelectItem key={pageSize} value={String(pageSize)}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>

    {/* Right: Delete + Pagination Controls */}
    <div className="flex items-center space-x-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            if (
              window.confirm(
                `Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} selected routes?`
              )
            ) {
              const token = localStorage.getItem("authToken");
              if (!token) {
                alert("You are not authorized to perform this action.");
                return;
              }

              const selectedRows = table.getFilteredSelectedRowModel().rows;

              try {
                for (const row of selectedRows) {
                  const routeId = row.original._id;
                  await fetch(
                    `/api/routes/${routeId}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                }

                alert("Selected routes deleted.");
                fetchRoute(); // Refresh
                table.resetRowSelection(); // Clear selection
              } catch (err) {
                alert("Error deleting selected routes.");
                console.error(err);
              }
            }
          }}
        >
          Delete Selected
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  </div>

        </>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{editingRoute ? "Edit Route entry" : "Create New Route entry"}</DialogTitle>
            <DialogDescription>Ensure information is correct per SOP/LOA</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Origin</label>
                <Input
                value={editForm?.origin || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, origin: e.target.value.toUpperCase() })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Destination</label>
                <Input
                value={editForm?.destination || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, destination: e.target.value.toUpperCase() })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Route</label>
                <Input
                value={editForm?.route || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, route: e.target.value })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Altitude</label>
                <Input
                value={editForm?.altitude || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, altitude: e.target.value })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Notes</label>
                <Input
                value={editForm?.notes || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                }
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Saving..." : editingRoute ? "Save Changes" : "Create Entry"}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

      {!loading && routes.length === 0 && <p>No routes found.</p>}

    </ThemeProvider>
  );
}