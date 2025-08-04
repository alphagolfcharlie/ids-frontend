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


export type Enroute = {
    _id: string;
    areas: string;
    field: string;
    qualifier: string;
    rule: string;
  };
  
export function EnrouteTable() {

    const [enroutes, setEnroutes] = useState<Enroute[]>([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [editingEnroute, setEditingEnroute] = useState<any | null>(null); // State for the crossing being edited
    const [editForm, setEditForm] = useState<any | null>(null); // State for the edit form data 
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog visibility

    // Fetch crossings

    const fetchEnroute = async () => {
        try {
        const response = await fetch("https://ids.alphagolfcharlie.dev/api/enroute", {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch enroutes");
        }

        const data = await response.json();
        setEnroutes(data); // Update state with the fetched enroutes
        } catch (err) {
        setError((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    // Delete an enroute
    const deleteEnroute = async (id: string) => {
        const token = localStorage.getItem("authToken"); // Retrieve the JWT token

        if (!token) {
            alert("You are not authorized to perform this action.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this enroute?")) {
            return;
        }

        try {
            const response = await fetch(`https://ids.alphagolfcharlie.dev/api/enroute/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
            });

            if (!response.ok) {
            throw new Error("Failed to delete enroute");
            }

            // Remove the deleted enroute from the state
            setEnroutes((prevEnroutes) => prevEnroutes.filter((enroute) => enroute._id !== id));
            alert("Enroute deleted successfully.");
        } catch (err) {
            alert("Error deleting enroute: " + (err as Error).message);
        }
        };

    // Open the dialog for creating a new entry
    const handleCreateEntry = () => {
        setEditingEnroute(null); // No enroute is being edited
        setEditForm({
        areas: "",
        field: "",
        qualifier: "",
        rule: "",
        }); // Initialize the form with default values
        setIsDialogOpen(true); // Open the dialog
    };

    const handleSaveEntry = (enroute: any) => {
        setEditingEnroute(enroute); // Set the enroute being edited
        setEditForm({ ...enroute }); // Initialize the edit form with the enroute's current data
        setIsDialogOpen(true); // Open the edit modal
        };     

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
            alert("You are not authorized to perform this action. Please log in.");
            return;
            }
        
        
            const isEdit = editingEnroute && editingEnroute._id && editingEnroute._id.trim() !== "";
            const url = isEdit
              ? `https://ids.alphagolfcharlie.dev/api/enroute/${editingEnroute._id}`
              : `https://ids.alphagolfcharlie.dev/api/enroute`;
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
            throw new Error(`Failed to ${editingEnroute ? "update" : "create"} enroute entry`);
            }
    
        
            //const updatedCrossing = await response.json();
        
            alert(`Enroute ${editingEnroute ? "updated" : "created"} successfully!`);
            setIsDialogOpen(false); // Close the dialog

            // Re-fetch the enroutes to refresh the table
            await fetchEnroute();
            } catch (err) {
            console.error(`Error ${editingEnroute ? "updating" : "creating"} enroute:`, err);
            alert(`Failed to ${editingEnroute ? "update" : "create"} enroute. Please try again.`);
            }
        };

    const handleCancelEdit = () => {
        setIsDialogOpen(false); // Close the dialog
    };

    useEffect(() => {
        fetchEnroute();
    }, []);

    // Define columns for the DataTable
  const columns: ColumnDef<Enroute>[] = [
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
      accessorKey: "areas",
      header: "Areas",
    },
    {
      accessorKey: "field",
      header: "Field",
    },
    {
      accessorKey: "qualifier",
      header: "Qualifier",
    },
    {
      accessorKey: "rule",
      header: "Rule",
    },
    
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
              const enroute = row.original;
          
              return (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveEntry(enroute)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEnroute(enroute._id)}
                  >
                    Delete
                  </Button>
                </div>
              );
            },
          },
  ];

  const table = useReactTable({
    data: enroutes,
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

    

      {loading && <p>Loading enroute entries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && enroutes.length > 0 && (
        <>
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
            {/* Create Entry Button */}
            <Button onClick={handleCreateEntry}>
            Create New Entry
            </Button>

            {/* Filter Input */}
            <Input
            placeholder="Filter by field..."
            value={(table.getColumn("field")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("field")?.setFilterValue(event.target.value)
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
            <DialogTitle>{editingEnroute ? "Edit Enroute entry" : "Create New Enroute entry"}</DialogTitle>
            <DialogDescription>Ensure information is correct per SOP/LOA</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Areas</label>
                <Input
                value={editForm?.areas || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, areas: e.target.value.toUpperCase() })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Field</label>
                <Input
                value={editForm?.field || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, field: e.target.value.toUpperCase() })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Qualifier</label>
                <Input
                value={editForm?.qualifier || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, qualifier: e.target.value })
                }
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Rule</label>
                <Input
                value={editForm?.rule || ""}
                onChange={(e) =>
                    setEditForm({ ...editForm, rule: e.target.value })
                }
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={loading}>
            {loading ? "Saving..." : editingEnroute ? "Save Changes" : "Create Entry"}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

      {!loading && enroutes.length === 0 && <p>No enroutes found.</p>}

    </ThemeProvider>
  );
}