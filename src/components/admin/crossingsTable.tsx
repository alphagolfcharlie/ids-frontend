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


export type Crossing = {
    _id: string;
    destination: string;
    fix: string;
    restriction: string;
    notes: string;
    artcc: string;
  };
  

export function CrossingsTable() {

    const [crossings, setCrossings] = useState<Crossing[]>([]); // State to store crossings
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [editingCrossing, setEditingCrossing] = useState<any | null>(null); // State for the crossing being edited
    const [editForm, setEditForm] = useState<any | null>(null); // State for the edit form data 
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog visibility

    // Fetch crossings from the API

    const fetchCrossings = async () => {
        try {
        const response = await fetch("/api/crossings", {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch crossings");
        }

        const data = await response.json();
        setCrossings(data); // Update state with the fetched crossings
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    // Delete a crossing
    const deleteCrossing = async (id: string) => {
        const token = localStorage.getItem("authToken"); // Retrieve the JWT token

        if (!token) {
            alert("You are not authorized to perform this action.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this crossing?")) {
            return;
        }

        try {
            const response = await fetch(`/api/crossings/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
            });

            if (!response.ok) {
            throw new Error("Failed to delete crossing");
            }

            // Remove the deleted crossing from the state
            setCrossings((prevCrossings) => prevCrossings.filter((crossing) => crossing._id !== id));
            alert("Crossing deleted successfully.");
        } catch (err) {
            alert("Error deleting crossing: " + (err as Error).message);
        }
        };
      // Open the dialog for creating a new entry
    const handleCreateEntry = () => {
        setEditingCrossing(null); // No crossing is being edited
        setEditForm({
        _id: "",
        destination: "",
        bdry_fix: "",
        restriction: "",
        notes: "",
        artcc: "",
        }); // Initialize the form with default values
        setIsDialogOpen(true); // Open the dialog
    };

    const handleSaveEntry = (crossing: any) => {
        setEditingCrossing(crossing); // Set the crossing being edited
        setEditForm({ ...crossing }); // Initialize the edit form with the crossing's current data
        setIsDialogOpen(true); // Open the edit modal
        };    

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
            alert("You are not authorized to perform this action. Please log in.");
            return;
            }
        
        
            const url = editingCrossing
            ? `/api/crossings/${editingCrossing._id}` // PUT for editing
            : `/api/crossings`; // POST for creating
    
          const method = editingCrossing ? "PUT" : "POST"; // Determine the HTTP method
    
          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include JWT token
            },
            body: JSON.stringify(editForm),
          });
        
          if (!response.ok) {
            throw new Error(`Failed to ${editingCrossing ? "update" : "create"} crossing`);
          }
    
        
            //const updatedCrossing = await response.json();
        
            alert(`Crossing ${editingCrossing ? "updated" : "created"} successfully!`);
            setIsDialogOpen(false); // Close the dialog
        
            // Re-fetch the crossings to refresh the table
            fetchCrossings();
            } catch (err) {
            console.error(`Error ${editingCrossing ? "updating" : "creating"} crossing:`, err);
            alert(`Failed to ${editingCrossing ? "update" : "create"} crossing. Please try again.`);
            }
        };
    const handleCancelEdit = () => {
        setIsDialogOpen(false); // Close the dialog
    };

    useEffect(() => {
        fetchCrossings();
    }, []);

  // Define columns for the DataTable
  const columns: ColumnDef<Crossing>[] = [
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
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "fix",
      header: "Boundary Fix",
    },
    {
      accessorKey: "restriction",
      header: "Restriction",
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      accessorKey: "artcc",
      header: "ARTCC",
    },
    
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
              const crossing = row.original;
          
              return (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveEntry(crossing)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCrossing(crossing._id)}
                  >
                    Delete
                  </Button>
                </div>
              );
            },
          },
  ];

  const table = useReactTable({
    data: crossings,
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

    

      {loading && <p>Loading crossings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && crossings.length > 0 && (
        <>
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
            {/* Create Entry Button */}
            <Button onClick={handleCreateEntry}>
            Create New Entry
            </Button>

            {/* Filter Input */}
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

    {/* Right: Pagination controls */}
    <div className="flex items-center space-x-2">
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
            <DialogTitle>{editingCrossing ? "Edit Crossing" : "Create New Crossing"}</DialogTitle>
            <DialogDescription>Ensure information is correct per SOP/LOA</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <label className="block text-sm font-medium">Boundary Fix</label>
                <Input
                value={editForm?.fix || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, fix: e.target.value.toUpperCase() })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Restriction</label>
                <Input
                value={editForm?.restriction || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, restriction: e.target.value })
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
            <div>
                <label className="block text-sm font-medium">ARTCC</label>
                <Input
                value={editForm?.artcc || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, artcc: e.target.value.toUpperCase() })
                }
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Saving..." : editingCrossing ? "Save Changes" : "Create Entry"}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

      {!loading && crossings.length === 0 && <p>No crossings found.</p>}

    </ThemeProvider>
  );
}