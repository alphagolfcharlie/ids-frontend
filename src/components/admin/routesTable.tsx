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
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"; // ✅ Import Sonner toast

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [editingRoute, setEditingRoute] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRoute = async () => {
    try {
      const response = await fetch("https://api.alphagolfcharlie.dev/ids/routes");
      if (!response.ok) throw new Error("Failed to fetch routes");
      const data = await response.json();
      setRoutes(data);
    } catch (err) {
      setError((err as Error).message);
      toast.error("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not authorized to perform this action.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this route?")) return;

    try {
      const response = await fetch(`https://api.alphagolfcharlie.dev/ids/routes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete route");

      setRoutes((prev) => prev.filter((route) => route._id !== id));
      toast.success("Route deleted successfully.");
    } catch (err) {
      toast.error("Error deleting route: " + (err as Error).message);
    }
  };

  const handleCreateEntry = () => {
    setEditingRoute(null);
    setEditForm({
      origin: "",
      destination: "",
      route: "",
      altitude: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveEntry = (route: any) => {
    setEditingRoute(route);
    setEditForm({ ...route });
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("You are not authorized. Please log in.");
        return;
      }

      const isEdit =
        editingRoute && editingRoute._id && editingRoute._id.trim() !== "";
      const url = isEdit
        ? `https://api.alphagolfcharlie.dev/ids/routes/${editingRoute._id}`
        : `https://api.alphagolfcharlie.dev/ids/routes`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok)
        throw new Error(
          `Failed to ${isEdit ? "update" : "create"} route entry`
        );

      toast.success(
        `Route ${isEdit ? "updated" : "created"} successfully!`
      );
      setIsDialogOpen(false);
      await fetchRoute();
    } catch (err) {
      toast.error(
        `Failed to ${editingRoute ? "update" : "create"} route.`
      );
    }
  };

  const handleCancelEdit = () => setIsDialogOpen(false);

  useEffect(() => {
    fetchRoute();
  }, []);

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
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "route", header: "Route" },
    { accessorKey: "altitude", header: "Altitude" },
    { accessorKey: "notes", header: "Notes" },
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {loading && <p>Loading route entries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && routes.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={handleCreateEntry}>Create New Entry</Button>
              <Input
                placeholder="Filter by origin..."
                value={
                  (table.getColumn("origin")?.getFilterValue() as string) ?? ""
                }
                onChange={(e) =>
                  table.getColumn("origin")?.setFilterValue(e.target.value)
                }
                className="w-64"
              />
              <Input
                placeholder="Filter by destination..."
                value={
                  (table.getColumn("destination")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(e) =>
                  table.getColumn("destination")?.setFilterValue(e.target.value)
                }
                className="w-64"
              />
            </div>
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
                  .map((column) => (
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
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
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

          {/* Footer */}
          <div className="flex items-center justify-between py-4 flex-wrap gap-4">
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

            <div className="flex items-center space-x-2">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (
                      window.confirm(
                        `Delete ${table.getFilteredSelectedRowModel().rows.length} selected routes?`
                      )
                    ) {
                      const token = localStorage.getItem("authToken");
                      if (!token) {
                        toast.error("You are not authorized.");
                        return;
                      }
                      try {
                        for (const row of table.getFilteredSelectedRowModel()
                          .rows) {
                          await fetch(`https://api.alphagolfcharlie.dev/ids/routes/${row.original._id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                        }
                        toast.success("Selected routes deleted.");
                        fetchRoute();
                        table.resetRowSelection();
                      } catch {
                        toast.error("Error deleting selected routes.");
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
            <DialogTitle>
              {editingRoute ? "Edit Route entry" : "Create New Route entry"}
            </DialogTitle>
            <DialogDescription>
              Ensure information is correct per SOP/LOA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Origin</label>
              <Input
                value={editForm?.origin || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    origin: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Destination</label>
              <Input
                value={editForm?.destination || ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    destination: e.target.value.toUpperCase(),
                  })
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
              {loading
                ? "Saving..."
                : editingRoute
                ? "Save Changes"
                : "Create Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!loading && routes.length === 0 && <p>No routes found.</p>}
    </ThemeProvider>
  );
}
