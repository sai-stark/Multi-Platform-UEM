import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Column } from "./types";
import { UseDataTableReturn } from "./useDataTable";

interface DataTableBodyProps<T> {
  table: UseDataTableReturn<T>;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
  quickActions?: (item: T) => React.ReactNode;
}

export function DataTableBody<T extends Record<string, any>>({
  table,
  emptyMessage = "No data available",
  onRowClick,
  rowActions,
  quickActions,
}: DataTableBodyProps<T>) {
  const { paginatedData, visibleColumnsList } = table;

  return (
    <TableBody>
      {paginatedData.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={
              visibleColumnsList.length + (rowActions || quickActions ? 1 : 0)
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
            {visibleColumnsList.map((col) => {
              const cellValue = col.accessor(item);
              const displayValue = col.render ? col.render(cellValue, item) : cellValue;
              const tooltipText = typeof cellValue === 'string' || typeof cellValue === 'number' 
                ? String(cellValue) 
                : '';
              
              return (
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
                  {tooltipText ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate cursor-default">{displayValue}</div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="break-words">{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="truncate">{displayValue}</div>
                  )}
                </TableCell>
              );
            })}
            {(rowActions || quickActions) && (
              <TableCell>
                <div className="flex items-center justify-start gap-1">
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
  );
}
