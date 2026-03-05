import React from "react";
import { Table } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataTableProps } from "./types";
import { useDataTable } from "./useDataTable";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";

// Re-export types for backward compatibility
export type { Column, DataTableProps } from "./types";
export { useDataTable } from "./useDataTable";

export function DataTable<T extends Record<string, any>>({
  data,
  columns: rawColumns,
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
  const table = useDataTable({
    data,
    columns: rawColumns,
    searchable,
    filterable,
    sortable,
    pagination,
    resizable,
    globalSearch,
    defaultPageSize,
    defaultSort,
    showExport,
    exportTitle,
    exportFilename,
    userName,
    dataMapping,
    pageSizeOptions,
    currentPage: externalCurrentPage,
    totalPages: externalTotalPages,
    totalElements: externalTotalElements,
    pageSize: externalPageSize,
    onPageChange: externalOnPageChange,
    onPageSizeChange: externalOnPageSizeChange,
    serverSidePagination,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`space-y-4 w-full ${className}`}>
        {/* Toolbar: Search, Filters, Column Toggle, Export */}
        <DataTableToolbar
          table={table}
          globalSearch={globalSearch}
          globalSearchPlaceholder={globalSearchPlaceholder}
          filterable={filterable}
          showColumnToggle={showColumnToggle}
          showExport={showExport}
          columns={table.columns}
        />

        {/* Table */}
        <div className="rounded-lg border overflow-hidden w-full">
          <div className="overflow-x-auto min-w-0">
            <Table className="w-full min-w-full">
              <colgroup>
                {table.visibleColumnsList.map((col) => (
                  <col
                    key={col.key}
                    className="min-w-0"
                    style={{
                      width: table.columnWidths[col.key] || col.width || "auto",
                    }}
                  />
                ))}
                {(rowActions || quickActions) && <col className="w-[120px]" />}
              </colgroup>

              <DataTableHeader
                table={table}
                sortable={sortable}
                filterable={filterable}
                resizable={resizable}
                rowActions={rowActions}
                quickActions={quickActions}
              />

              <DataTableBody
                table={table}
                emptyMessage={emptyMessage}
                onRowClick={onRowClick}
                rowActions={rowActions}
                quickActions={quickActions}
              />
            </Table>
          </div>

          {/* Pagination */}
          {pagination && (
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
