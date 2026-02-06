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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "number" | "date"; // Type for filter operators
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
  quickActions?: (item: T) => React.ReactNode; // Actions displayed as icons outside the dropdown
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

// Filter operators by type
type TextFilterOperator = "contains" | "equals" | "not_equals" | "starts_with" | "ends_with" | "is_empty" | "is_not_empty";
type NumberFilterOperator = "equals" | "not_equals" | "gt" | "gte" | "lt" | "lte" | "is_empty" | "is_not_empty";
type DateFilterOperator = "equals" | "not_equals" | "after" | "before" | "on_or_after" | "on_or_before" | "is_empty" | "is_not_empty";
type FilterOperator = TextFilterOperator | NumberFilterOperator | DateFilterOperator;

interface AdvancedFilter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

const TEXT_FILTER_OPERATORS: { value: TextFilterOperator; label: string }[] = [
  { value: "contains", label: "contains" },
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const NUMBER_FILTER_OPERATORS: { value: NumberFilterOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "gt", label: "greater than" },
  { value: "gte", label: "greater than or equal" },
  { value: "lt", label: "less than" },
  { value: "lte", label: "less than or equal" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const DATE_FILTER_OPERATORS: { value: DateFilterOperator; label: string }[] = [
  { value: "equals", label: "on" },
  { value: "not_equals", label: "not on" },
  { value: "after", label: "after" },
  { value: "before", label: "before" },
  { value: "on_or_after", label: "on or after" },
  { value: "on_or_before", label: "on or before" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const getOperatorsForType = (filterType: "text" | "number" | "date" = "text") => {
  switch (filterType) {
    case "number":
      return NUMBER_FILTER_OPERATORS;
    case "date":
      return DATE_FILTER_OPERATORS;
    default:
      return TEXT_FILTER_OPERATORS;
  }
};

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
  quickActions,
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
  const [searchColumn, setSearchColumn] = useState<string>("all"); // "all" means search all columns
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
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
      result = result.filter((item) => {
        if (searchColumn === "all") {
          // Search across all searchable columns
          return columns.some((col) => {
            if (!col.searchable) return false;
            const value = col.accessor(item);
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
          });
        } else {
          // Search in specific column
          const col = columns.find((c) => c.key === searchColumn);
          if (!col) return true;
          const value = col.accessor(item);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    // Column filters (legacy simple filters)
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

    // Advanced filters
    advancedFilters.forEach((filter) => {
      if (!filter.column) return;
      
      result = result.filter((item) => {
        const col = columns.find((c) => c.key === filter.column);
        if (!col) return true;
        const rawValue = col.accessor(item);
        const filterType = col.filterType || "text";

        // Handle empty/not empty operators first
        if (filter.operator === "is_empty") {
          return rawValue === null || rawValue === undefined || rawValue === "" || String(rawValue).trim() === "";
        }
        if (filter.operator === "is_not_empty") {
          return rawValue !== null && rawValue !== undefined && rawValue !== "" && String(rawValue).trim() !== "";
        }

        // Handle based on filter type
        if (filterType === "number") {
          const numValue = parseFloat(String(rawValue));
          const filterNum = parseFloat(filter.value);
          
          if (isNaN(numValue) || isNaN(filterNum)) {
            // Fallback to string comparison if not valid numbers
            const itemStr = String(rawValue ?? "").toLowerCase();
            const filterStr = filter.value.toLowerCase();
            return filter.operator === "equals" ? itemStr === filterStr : itemStr !== filterStr;
          }

          switch (filter.operator) {
            case "equals":
              return numValue === filterNum;
            case "not_equals":
              return numValue !== filterNum;
            case "gt":
              return numValue > filterNum;
            case "gte":
              return numValue >= filterNum;
            case "lt":
              return numValue < filterNum;
            case "lte":
              return numValue <= filterNum;
            default:
              return true;
          }
        } else if (filterType === "date") {
          const dateValue = new Date(rawValue);
          const filterDate = new Date(filter.value);
          
          if (isNaN(dateValue.getTime()) || isNaN(filterDate.getTime())) {
            // Fallback to string comparison if not valid dates
            const itemStr = String(rawValue ?? "").toLowerCase();
            const filterStr = filter.value.toLowerCase();
            return filter.operator === "equals" ? itemStr === filterStr : itemStr !== filterStr;
          }

          // Normalize to start of day for date comparisons
          const normalizedItemDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
          const normalizedFilterDate = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());

          switch (filter.operator) {
            case "equals":
              return normalizedItemDate.getTime() === normalizedFilterDate.getTime();
            case "not_equals":
              return normalizedItemDate.getTime() !== normalizedFilterDate.getTime();
            case "after":
              return normalizedItemDate.getTime() > normalizedFilterDate.getTime();
            case "before":
              return normalizedItemDate.getTime() < normalizedFilterDate.getTime();
            case "on_or_after":
              return normalizedItemDate.getTime() >= normalizedFilterDate.getTime();
            case "on_or_before":
              return normalizedItemDate.getTime() <= normalizedFilterDate.getTime();
            default:
              return true;
          }
        } else {
          // Text filter
          const itemValue = String(rawValue ?? "").toLowerCase();
          const filterValue = filter.value.toLowerCase();

          switch (filter.operator) {
            case "contains":
              return itemValue.includes(filterValue);
            case "equals":
              return itemValue === filterValue;
            case "not_equals":
              return itemValue !== filterValue;
            case "starts_with":
              return itemValue.startsWith(filterValue);
            case "ends_with":
              return itemValue.endsWith(filterValue);
            default:
              return true;
          }
        }
      });
    });

    return result;
  }, [data, searchTerm, searchColumn, filters, advancedFilters, columns, globalSearch]);

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

  // Advanced filter handlers
  const addAdvancedFilter = () => {
    const filterableColumns = columns.filter((col) => col.filterable);
    const firstColumn = filterableColumns.length > 0 ? filterableColumns[0].key : "";
    setAdvancedFilters((prev) => [
      ...prev,
      {
        id: `filter-${Date.now()}`,
        column: firstColumn,
        operator: "contains",
        value: "",
      },
    ]);
  };

  const updateAdvancedFilter = (id: string, updates: Partial<AdvancedFilter>) => {
    setAdvancedFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
    setPage(1);
  };

  const removeAdvancedFilter = (id: string) => {
    setAdvancedFilters((prev) => prev.filter((filter) => filter.id !== id));
    setPage(1);
  };

  const removeAllAdvancedFilters = () => {
    setAdvancedFilters([]);
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
          <div className="flex flex-1 gap-2">
            <Select
              value={searchColumn}
              onValueChange={(value) => setSearchColumn(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                {columns
                  .filter((col) => col.searchable)
                  .map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.header}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  searchColumn === "all"
                    ? globalSearchPlaceholder
                    : `Search ${columns.find((c) => c.key === searchColumn)?.header || ""}...`
                }
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                aria-label={globalSearchPlaceholder}
              />
            </div>
          </div>
        )}

        {/* Advanced Filter Panel */}
        {filterable && (
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={advancedFilters.length > 0 ? "default" : "outline"}
                size="sm"
                className={`transition-all duration-200 ${
                  advancedFilters.length > 0 
                    ? "bg-primary hover:bg-primary/90 shadow-md" 
                    : "hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {advancedFilters.length > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold">
                    {advancedFilters.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[580px] p-0 shadow-xl border-0 overflow-hidden" 
              align="start"
              sideOffset={8}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Filter className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Advanced Filters</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {advancedFilters.length === 0 
                          ? "No filters applied" 
                          : `${advancedFilters.length} filter${advancedFilters.length > 1 ? 's' : ''} active`
                        }
                      </p>
                    </div>
                  </div>
                  {advancedFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={removeAllAdvancedFilters}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Content */}
              <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto bg-gradient-to-b from-muted/20 to-transparent">
                {advancedFilters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">No filters applied</p>
                    <p className="text-xs text-muted-foreground/70">Add a filter to narrow down your results</p>
                  </div>
                ) : (
                  advancedFilters.map((filter, index) => {
                    const selectedCol = columns.find((c) => c.key === filter.column);
                    const filterType = selectedCol?.filterType || "text";
                    
                    return (
                      <div 
                        key={filter.id} 
                        className="group relative flex items-center gap-2 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                      >
                        {/* Row Number */}
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                          {index + 1}
                        </div>

                        {/* Column Select */}
                        <Select
                          value={filter.column}
                          onValueChange={(value) => {
                            const newCol = columns.find((c) => c.key === value);
                            const newFilterType = newCol?.filterType || "text";
                            const operators = getOperatorsForType(newFilterType);
                            const validOperator = operators.some((op) => op.value === filter.operator)
                              ? filter.operator
                              : operators[0].value;
                            updateAdvancedFilter(filter.id, { 
                              column: value, 
                              operator: validOperator,
                              value: "" 
                            });
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-9 text-xs font-medium bg-muted/50 border-0 focus:ring-1 focus:ring-primary/30">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns
                              .filter((col) => col.filterable)
                              .map((col) => (
                                <SelectItem key={col.key} value={col.key} className="text-xs">
                                  {col.header}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {/* Operator Select */}
                        <Select
                          value={filter.operator}
                          onValueChange={(value) =>
                            updateAdvancedFilter(filter.id, {
                              operator: value as FilterOperator,
                            })
                          }
                        >
                          <SelectTrigger className="w-[150px] h-9 text-xs font-medium bg-muted/50 border-0 focus:ring-1 focus:ring-primary/30">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorsForType(filterType).map((op) => (
                              <SelectItem key={op.value} value={op.value} className="text-xs">
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Value Input */}
                        {filter.operator !== "is_empty" && filter.operator !== "is_not_empty" && (
                          filterType === "date" ? (
                            <Input
                              type="date"
                              value={filter.value}
                              onChange={(e) =>
                                updateAdvancedFilter(filter.id, { value: e.target.value })
                              }
                              className="flex-1 h-9 text-xs bg-muted/50 border-0 focus:ring-1 focus:ring-primary/30"
                            />
                          ) : filterType === "number" ? (
                            <Input
                              type="number"
                              placeholder="Enter value"
                              value={filter.value}
                              onChange={(e) =>
                                updateAdvancedFilter(filter.id, { value: e.target.value })
                              }
                              className="flex-1 h-9 text-xs bg-muted/50 border-0 focus:ring-1 focus:ring-primary/30"
                            />
                          ) : (
                            <Input
                              placeholder="Enter value"
                              value={filter.value}
                              onChange={(e) =>
                                updateAdvancedFilter(filter.id, { value: e.target.value })
                              }
                              className="flex-1 h-9 text-xs bg-muted/50 border-0 focus:ring-1 focus:ring-primary/30"
                            />
                          )
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-50 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => removeAdvancedFilter(filter.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-muted/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-sm font-medium border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                  onClick={addAdvancedFilter}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter Condition
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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
              {(rowActions || quickActions) && <col className="w-[120px]" />}
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
                {(rowActions || quickActions) && (
                  <TableHead className="w-[120px]">
                    <span className="text-muted-foreground">Actions</span>
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
                    {(rowActions || quickActions) && (
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {quickActions && quickActions(item)}
                          {rowActions && (
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
                          )}
                        </div>
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
                    className="h-8 w-16 text-center border-2 border-sky-400 bg-background focus:border-sky-500 focus:ring-2 focus:ring-sky-300/30 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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

