import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Columns,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  render?: (value: any, item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  exportable?: boolean;
  hidden?: boolean; // Hide column by default (can be toggled via column visibility menu)
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  resizable?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  rowActions?: (item: T) => React.ReactNode;
  globalSearch?: boolean;
  globalSearchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultSort?: { key: string; dir: "desc" | "asc" };
  showColumnToggle?: boolean;
  showExport?: boolean;
  onExport?: () => void;
  exportTitle?: string;
  exportFilename?: string;
  userName?: string;
  dataMapping?: Record<string, string>;

  // Server-side pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  serverSidePagination?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  filterable = true,
  sortable = true,
  pagination = true,
  resizable = true,
  onRowClick,
  className = "",
  emptyMessage = "No data available",
  loading = false,
  rowActions,
  globalSearch = true,
  globalSearchPlaceholder = "Search...",
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  defaultSort,
  showColumnToggle = true,
  showExport = false,
  onExport,
  exportTitle = "Data Export",
  exportFilename = "export",
  userName = "User",
  dataMapping,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  totalElements: externalTotalElements,
  pageSize: externalPageSize,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  serverSidePagination = false,
}: DataTableProps<T>) {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>(
    defaultSort || { key: "", dir: "asc" }
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(externalPageSize || defaultPageSize);

  // Update page size when external page size changes
  useEffect(() => {
    if (externalPageSize && serverSidePagination) {
      setPageSize(externalPageSize);
    }
  }, [externalPageSize, serverSidePagination]);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter((col) => !col.hidden).map((col) => col.key))
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columns.reduce(
      (acc, col) => ({
        ...acc,
        [col.key]:
          col.width ||
          (col.key === "name" || col.key === "description" ? 200 : 150),
      }),
      {}
    )
  );

  // Resize state
  const [resizing, setResizing] = useState<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Computed data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search
    if (globalSearch && searchTerm) {
      result = result.filter((item) =>
        columns.some((col) => {
          if (!col.searchable) return false;
          const value = col.accessor(item);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const col = columns.find((c) => c.key === key);
          if (!col) return true;
          const itemValue = col.accessor(item);
          return (
            String(itemValue).toLowerCase() === String(value).toLowerCase()
          );
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns, globalSearch]);

  const sortedData = useMemo(() => {
    if (!sort.key) return filteredData;

    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = col.accessor(a);
      const bVal = col.accessor(b);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.dir === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal ?? "").toLowerCase();
      const bStr = String(bVal ?? "").toLowerCase();
      return sort.dir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sort, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    // For server-side pagination, use the data as-is
    if (serverSidePagination) {
      return data;
    }

    // For client-side pagination, slice the data
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize, pagination, serverSidePagination, data]);

  const totalPages = useMemo(() => {
    if (!pagination) return 1;

    // For server-side pagination, use external total pages
    if (serverSidePagination && externalTotalPages) {
      return externalTotalPages;
    }

    // For client-side pagination, calculate from data length
    return Math.max(1, Math.ceil(sortedData.length / pageSize));
  }, [
    sortedData.length,
    pageSize,
    pagination,
    serverSidePagination,
    externalTotalPages,
  ]);

  // Handlers
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
    setPage(1);
  };

  const handleFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (serverSidePagination && externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setPage(Math.max(1, Math.min(newPage, totalPages)));
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (serverSidePagination && externalOnPageSizeChange) {
      externalOnPageSizeChange(newPageSize);
    } else {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Export handlers
  const handleExportPDF = () => {
    const exportableColumns = visibleColumnsList.filter(
      (col) => col.exportable !== false
    );
    const headers = exportableColumns.map((col) => col.header);
    const exportData = sortedData.map((item) => {
      const row: any = {};
      exportableColumns.forEach((col) => {
        row[col.header] = col.accessor(item);
      });
      return row;
    });

    // Generate dynamic filename with module name and date
    const currentDate = new Date().toISOString().split("T")[0];
    const dynamicFilename = `${exportFilename}_${currentDate}`;

    exportToPDF(
      exportData,
      headers,
      dynamicFilename,
      exportTitle,
      userName,
      dataMapping
    );
  };

  const handleExportCSV = () => {
    const exportableColumns = visibleColumnsList.filter(
      (col) => col.exportable !== false
    );
    const headers = exportableColumns.map((col) => col.header);
    const exportData = sortedData.map((item) => {
      const row: any = {};
      exportableColumns.forEach((col) => {
        row[col.header] = col.accessor(item);
      });
      return row;
    });

    // Generate dynamic filename with module name and date
    const currentDate = new Date().toISOString().split("T")[0];
    const dynamicFilename = `${exportFilename}_${currentDate}`;

    exportToCSV(exportData, headers, dynamicFilename, dataMapping);
  };

  // Resize handlers
  const startResize = (column: string) => (e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column] || 150,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing) return;
    const delta = e.clientX - resizing.startX;
    const minWidth =
      columns.find((c) => c.key === resizing.column)?.minWidth || 100;
    const newWidth = Math.max(resizing.startWidth + delta, minWidth);

    setColumnWidths((prev) => ({ ...prev, [resizing.column]: newWidth }));
  };

  const stopResize = () => {
    setResizing(null);
  };

  // Effects
  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", stopResize);
        document.body.style.cursor = "";
      };
    }
  }, [resizing]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  // Render helpers
  const renderSortIcon = (key: string) => {
    if (!sortable) return null;
    if (sort.key !== key)
      return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return sort.dir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    );
  };

  const renderCell = (item: T, column: Column<T>) => {
    const value = column.accessor(item);
    if (column.render) {
      return column.render(value, item);
    }
    return value;
  };

  const visibleColumnsList = columns.filter((col) =>
    visibleColumns.has(col.key)
  );

  // Get unique values for filter dropdowns
  const getFilterOptions = (column: Column<T>) => {
    if (!column.filterable) return [];
    const values = new Set<string>();
    data.forEach((item) => {
      const value = column.accessor(item);
      if (value !== null && value !== undefined) {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Global Search */}
        {globalSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={globalSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              aria-label={globalSearchPlaceholder}
            />
          </div>
        )}

        {/* Column Filters */}
        {filterable && (
          <div className="flex gap-2 flex-wrap">
            {columns
              .filter((col) => col.filterable && visibleColumns.has(col.key))
              .map((col) => {
                const options = getFilterOptions(col);
                if (options.length === 0) return null;

                return (
                  <Select
                    key={col.key}
                    value={filters[col.key] || "all"}
                    onValueChange={(value) => handleFilter(col.key, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={col.header} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {col.header}</SelectItem>
                      {options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={visibleColumns.has(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden w-full">
        <div className="overflow-x-auto min-w-0">
          <Table className="w-full min-w-full">
            <colgroup>
              {visibleColumnsList.map((col) => (
                <col
                  key={col.key}
                  className="min-w-0"
                  style={{
                    width: columnWidths[col.key] || col.width || "auto",
                  }}
                />
              ))}
              {rowActions && <col className="w-[50px]" />}
            </colgroup>
            <TableHeader>
              <TableRow>
                {visibleColumnsList.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`relative group min-w-0 ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`-ml-3 gap-1 w-full ${
                        col.align === "center"
                          ? "justify-center"
                          : col.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      disabled={!sortable || col.sortable === false}
                      title={col.header}
                    >
                      <span className="truncate">{col.header}</span>
                      {col.sortable !== false && renderSortIcon(col.key)}
                    </Button>
                    {resizable && (
                      <span
                        onMouseDown={startResize(col.key)}
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize bg-transparent group-hover:bg-border"
                      />
                    )}
                  </TableHead>
                ))}
                {rowActions && (
                  <TableHead className="w-[50px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumnsList.length + (rowActions ? 1 : 0)
                    }
                    className="text-center py-8"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id || `row-${index}`}
                    className={`hover:bg-muted/50 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick?.(item);
                      }
                    }}
                  >
                    {visibleColumnsList.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`min-w-0 ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        <div className="truncate">{renderCell(item, col)}</div>
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Row actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions(item)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => handlePageSizeChange(parseInt(v))}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {serverSidePagination && externalTotalElements ? (
                  <>
                    {Math.min(
                      ((externalCurrentPage || 1) - 1) * pageSize + 1,
                      externalTotalElements
                    )}
                    -
                    {Math.min(
                      (externalCurrentPage || 1) * pageSize,
                      externalTotalElements
                    )}{" "}
                    of {externalTotalElements}
                  </>
                ) : (
                  <>
                    {sortedData.length === 0 ? 0 : Math.min((page - 1) * pageSize + 1, sortedData.length)}-
                    {Math.min(page * pageSize, sortedData.length)} of{" "}
                    {sortedData.length}
                  </>
                )}
              </span>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={
                    (serverSidePagination ? externalCurrentPage || 1 : page) ===
                      1 || totalPages === 1
                  }
                  onClick={() => handlePageChange(1)}
                  aria-label="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={
                    (serverSidePagination ? externalCurrentPage || 1 : page) ===
                      1 || totalPages === 1
                  }
                  onClick={() =>
                    handlePageChange(
                      (serverSidePagination ? externalCurrentPage || 1 : page) -
                        1
                    )
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {/* Go to page input */}
                <div className="flex items-center gap-2 mx-2">
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={
                      serverSidePagination ? externalCurrentPage || 1 : page
                    }
                    onChange={(e) => {
                      const pageNum = parseInt(e.target.value);
                      if (pageNum >= 1 && pageNum <= totalPages) {
                        handlePageChange(pageNum);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const pageNum = parseInt(
                          (e.target as HTMLInputElement).value
                        );
                        if (pageNum >= 1 && pageNum <= totalPages) {
                          handlePageChange(pageNum);
                        }
                      }
                    }}
                    className="h-8 w-16 text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    aria-label="Go to page"
                  />
                  <span className="text-sm text-muted-foreground">
                    of {totalPages}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={
                    (serverSidePagination ? externalCurrentPage || 1 : page) ===
                      totalPages || totalPages === 1
                  }
                  onClick={() =>
                    handlePageChange(
                      (serverSidePagination ? externalCurrentPage || 1 : page) +
                        1
                    )
                  }
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={
                    (serverSidePagination ? externalCurrentPage || 1 : page) ===
                      totalPages || totalPages === 1
                  }
                  onClick={() => handlePageChange(totalPages)}
                  aria-label="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

