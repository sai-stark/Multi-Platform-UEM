import { useState, useMemo, useEffect } from "react";
import { Column, AdvancedFilter, FilterOperator, getOperatorsForType } from "./types";
import { exportToPDF, exportToCSV } from "@/lib/exportUtils";

interface UseDataTableOptions<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    filterable?: boolean;
    sortable?: boolean;
    pagination?: boolean;
    resizable?: boolean;
    globalSearch?: boolean;
    defaultPageSize?: number;
    defaultSort?: { key: string; dir: "desc" | "asc" };
    showExport?: boolean;
    exportTitle?: string;
    exportFilename?: string;
    userName?: string;
    dataMapping?: Record<string, string>;
    pageSizeOptions?: number[];

    // Server-side pagination
    currentPage?: number;
    totalPages?: number;
    totalElements?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    serverSidePagination?: boolean;
}

export function useDataTable<T extends Record<string, any>>({
    data,
    columns: rawColumns,
    sortable = true,
    pagination = true,
    resizable = true,
    globalSearch = true,
    defaultPageSize = 10,
    defaultSort,
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
}: UseDataTableOptions<T>) {
    // Normalize columns: default sortable, searchable, filterable to true
    const columns = useMemo(() =>
        rawColumns.map((col) => ({
            ...col,
            sortable: col.sortable !== false,
            searchable: col.searchable !== false,
            filterable: col.filterable !== false,
        })),
        [rawColumns]
    );

    // State management
    const [searchTerm, setSearchTerm] = useState("");
    const [searchColumns, setSearchColumns] = useState<Set<string>>(new Set(["all"]));
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
                const isAllSelected = searchColumns.has("all");

                if (isAllSelected) {
                    return columns.some((col) => {
                        if (!col.searchable) return false;
                        const value = col.accessor(item);
                        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                    });
                } else {
                    return columns.some((col) => {
                        if (!searchColumns.has(col.key)) return false;
                        const value = col.accessor(item);
                        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                    });
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
                        const itemStr = String(rawValue ?? "").toLowerCase();
                        const filterStr = filter.value.toLowerCase();
                        return filter.operator === "equals" ? itemStr === filterStr : itemStr !== filterStr;
                    }

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
    }, [data, searchTerm, searchColumns, filters, advancedFilters, columns, globalSearch]);

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

        if (serverSidePagination) {
            return data;
        }

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize, pagination, serverSidePagination, data]);

    const totalPages = useMemo(() => {
        if (!pagination) return 1;

        if (serverSidePagination && externalTotalPages) {
            return externalTotalPages;
        }

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

    const getFiltersForColumn = (columnKey: string) => {
        return advancedFilters.filter((f) => f.column === columnKey);
    };

    const addFilterForColumn = (columnKey: string) => {
        const col = columns.find((c) => c.key === columnKey);
        const filterType = col?.filterType || "text";
        const operators = getOperatorsForType(filterType);
        setAdvancedFilters((prev) => [
            ...prev,
            {
                id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                column: columnKey,
                operator: operators[0].value,
                value: "",
            },
        ]);
        setPage(1);
    };

    const removeFiltersForColumn = (columnKey: string) => {
        setAdvancedFilters((prev) => prev.filter((f) => f.column !== columnKey));
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

    const visibleColumnsList = columns.filter((col) =>
        visibleColumns.has(col.key)
    );

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

    // Sync visibleColumns when columns prop changes
    useEffect(() => {
        setVisibleColumns(new Set(columns.filter((col) => !col.hidden).map((col) => col.key)));
    }, [columns.map((c) => c.key).join(',')]);

    // Render helpers
    const renderCell = (item: T, column: Column<T>) => {
        const value = column.accessor(item);
        if (column.render) {
            return column.render(value, item);
        }
        return value;
    };

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

    return {
        // Normalized columns
        columns,
        visibleColumns,
        visibleColumnsList,
        columnWidths,

        // Search state
        searchTerm,
        setSearchTerm,
        searchColumns,
        setSearchColumns,

        // Filter state
        filters,
        advancedFilters,
        filterPopoverOpen,
        setFilterPopoverOpen,

        // Sort state
        sort,

        // Pagination state
        page,
        pageSize,
        totalPages,

        // Computed data
        filteredData,
        sortedData,
        paginatedData,

        // Handlers
        handleSort,
        handleFilter,
        handleSearch,
        handlePageChange,
        handlePageSizeChange,
        toggleColumn,

        // Advanced filter handlers
        addAdvancedFilter,
        updateAdvancedFilter,
        removeAdvancedFilter,
        removeAllAdvancedFilters,
        getFiltersForColumn,
        addFilterForColumn,
        removeFiltersForColumn,

        // Export handlers
        handleExportPDF,
        handleExportCSV,

        // Resize handlers
        startResize,

        // Render helpers
        renderCell,
        getFilterOptions,

        // Server-side pagination context
        serverSidePagination,
        externalCurrentPage,
        externalTotalElements,
    };
}

export type UseDataTableReturn<T> = ReturnType<typeof useDataTable<T>>;
