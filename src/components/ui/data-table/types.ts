import React from "react";

export interface Column<T> {
    key: string;
    header: string;
    accessor: (item: T) => any;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: "text" | "number" | "date";
    searchable?: boolean;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    render?: (value: any, item: T) => React.ReactNode;
    align?: "left" | "center" | "right";
    exportable?: boolean;
    hidden?: boolean;
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
    emptyMessage?: React.ReactNode;
    loading?: boolean;
    rowActions?: (item: T) => React.ReactNode;
    quickActions?: (item: T) => React.ReactNode;
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
export type TextFilterOperator = "contains" | "equals" | "not_equals" | "starts_with" | "ends_with" | "is_empty" | "is_not_empty";
export type NumberFilterOperator = "equals" | "not_equals" | "gt" | "gte" | "lt" | "lte" | "is_empty" | "is_not_empty";
export type DateFilterOperator = "equals" | "not_equals" | "after" | "before" | "on_or_after" | "on_or_before" | "is_empty" | "is_not_empty";
export type FilterOperator = TextFilterOperator | NumberFilterOperator | DateFilterOperator;

export interface AdvancedFilter {
    id: string;
    column: string;
    operator: FilterOperator;
    value: string;
}

export const TEXT_FILTER_OPERATORS: { value: TextFilterOperator; label: string }[] = [
    { value: "contains", label: "contains" },
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "does not equal" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
];

export const NUMBER_FILTER_OPERATORS: { value: NumberFilterOperator; label: string }[] = [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "does not equal" },
    { value: "gt", label: "greater than" },
    { value: "gte", label: "greater than or equal" },
    { value: "lt", label: "less than" },
    { value: "lte", label: "less than or equal" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
];

export const DATE_FILTER_OPERATORS: { value: DateFilterOperator; label: string }[] = [
    { value: "equals", label: "on" },
    { value: "not_equals", label: "not on" },
    { value: "after", label: "after" },
    { value: "before", label: "before" },
    { value: "on_or_after", label: "on or after" },
    { value: "on_or_before", label: "on or before" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
];

export const getOperatorsForType = (filterType: "text" | "number" | "date" = "text") => {
    switch (filterType) {
        case "number":
            return NUMBER_FILTER_OPERATORS;
        case "date":
            return DATE_FILTER_OPERATORS;
        default:
            return TEXT_FILTER_OPERATORS;
    }
};
