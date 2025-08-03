"use client";


import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/ui/navbar"; // Import your Navbar component
import {
  flexRender,
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
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Crossing = {
  _id: string;
  destination: string;
  bdry_fix: string;
  restriction: string;
  notes: string;
  artcc: string;
};

export function AdminPage() {
  const [crossings, setCrossings] = useState<Crossing[]>([]); // State to store crossings
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Fetch crossings from the API
  const fetchCrossings = async () => {
    try {
      const response = await fetch("https://ids.alphagolfcharlie.dev/api/crossings", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch crossings");
      }

      const data = await response.json();
      console.log("Fetched crossings:", data);
      setCrossings(data); // Update state with the fetched crossings
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

// Delete a crossing
const deleteCrossing = async (id: string) => {
    console.log("Deleting crossing with ID:", id); // Debugging
    const token = localStorage.getItem("authToken"); // Retrieve the JWT token

    if (!token) {
        alert("You are not authorized to perform this action.");
        return;
    }

    if (!window.confirm("Are you sure you want to delete this crossing?")) {
        return;
    }

    try {
        const response = await fetch(`https://ids.alphagolfcharlie.dev/api/crossings/${id}`, {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Crossing</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteCrossing(crossing._id)} // Call deleteCrossing when clicked
              >
                Delete Crossing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="w-3/4 p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <p>Welcome to the admin dashboard!</p>

      {loading && <p>Loading crossings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && crossings.length > 0 && (
        <>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter by destination..."
              value={(table.getColumn("destination")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("destination")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown />
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
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

      {!loading && crossings.length === 0 && <p>No crossings found.</p>}
    </div>
    </div>
    </ThemeProvider>
  );
}