import React from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseDataTableReturn } from "./useDataTable";

interface DataTablePaginationProps<T> {
  table: UseDataTableReturn<T>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<T extends Record<string, any>>({
  table,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTablePaginationProps<T>) {
  const {
    page,
    pageSize,
    totalPages,
    sortedData,
    handlePageChange,
    handlePageSizeChange,
    serverSidePagination,
    externalCurrentPage,
    externalTotalElements,
  } = table;

  return (
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
  );
}
