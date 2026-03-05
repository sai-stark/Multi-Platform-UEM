import React from "react";
import {
  Filter,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column, FilterOperator, getOperatorsForType } from "./types";
import { UseDataTableReturn } from "./useDataTable";

interface DataTableHeaderProps<T> {
  table: UseDataTableReturn<T>;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  rowActions?: (item: T) => React.ReactNode;
  quickActions?: (item: T) => React.ReactNode;
}

export function DataTableHeader<T extends Record<string, any>>({
  table,
  sortable = true,
  filterable = true,
  resizable = true,
  rowActions,
  quickActions,
}: DataTableHeaderProps<T>) {
  const {
    visibleColumnsList,
    columnWidths,
    sort,
    handleSort,
    getFiltersForColumn,
    updateAdvancedFilter,
    removeAdvancedFilter,
    addFilterForColumn,
    removeFiltersForColumn,
    startResize,
  } = table;

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

  return (
    <TableHeader>
      <TableRow>
        {visibleColumnsList.map((col) => {
          const columnFilters = getFiltersForColumn(col.key);
          const filterType = col.filterType || "text";
          const operators = getOperatorsForType(filterType);
          
          return (
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
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`-ml-3 gap-1 flex-1 ${
                    col.align === "center"
                      ? "justify-center"
                      : col.align === "right"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  disabled={!sortable || col.sortable === false}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate">{col.header}</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{col.header}</p>
                    </TooltipContent>
                  </Tooltip>
                  {col.sortable !== false && renderSortIcon(col.key)}

                  {/* Column Filter Icon */}
                  {col.filterable && filterable && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className={`ml-1 p-0.5 rounded hover:bg-muted transition-all relative cursor-pointer ${
                            columnFilters.length > 0
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={`Filter ${col.header}`}
                        >
                          <Filter className="h-3 w-3" />
                          {columnFilters.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-bold shadow-sm">
                              {columnFilters.length}
                            </span>
                          )}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-[320px] p-0 shadow-xl border-0 overflow-hidden" 
                        align="start"
                        sideOffset={8}
                      >
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-3 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                                <Filter className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{col.header}</h4>
                                <p className="text-[10px] text-muted-foreground">
                                  {columnFilters.length === 0 
                                    ? "No filters" 
                                    : `${columnFilters.length} filter${columnFilters.length > 1 ? 's' : ''} active`}
                                </p>
                              </div>
                            </div>
                            {columnFilters.length > 0 && (
                              <button
                                onClick={() => removeFiltersForColumn(col.key)}
                                className="text-xs text-destructive hover:text-destructive/80 font-medium px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Filters Content */}
                        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto bg-gradient-to-b from-muted/10 to-transparent">
                          {columnFilters.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 mb-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground">No filters applied</p>
                              <p className="text-[10px] text-muted-foreground/70">Click below to add one</p>
                            </div>
                          ) : (
                            columnFilters.map((filter, idx) => (
                              <div 
                                key={filter.id} 
                                className="group flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all"
                              >
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                                  {idx + 1}
                                </span>
                                <Select
                                  value={filter.operator}
                                  onValueChange={(value) =>
                                    updateAdvancedFilter(filter.id, { operator: value as FilterOperator })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs flex-1 bg-muted/30 border-0 focus:ring-1 focus:ring-primary/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operators.map((op) => (
                                      <SelectItem key={op.value} value={op.value} className="text-xs">
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {filter.operator !== "is_empty" && filter.operator !== "is_not_empty" && (
                                  filterType === "date" ? (
                                    <Input
                                      type="date"
                                      value={filter.value}
                                      onChange={(e) => updateAdvancedFilter(filter.id, { value: e.target.value })}
                                      className="h-8 text-xs flex-1 bg-muted/30 border-0 focus:ring-1 focus:ring-primary/30"
                                    />
                                  ) : filterType === "number" ? (
                                    <Input
                                      type="number"
                                      placeholder="Value"
                                      value={filter.value}
                                      onChange={(e) => updateAdvancedFilter(filter.id, { value: e.target.value })}
                                      className="h-8 text-xs flex-1 bg-muted/30 border-0 focus:ring-1 focus:ring-primary/30"
                                    />
                                  ) : (
                                    <Input
                                      placeholder="Value"
                                      value={filter.value}
                                      onChange={(e) => updateAdvancedFilter(filter.id, { value: e.target.value })}
                                      className="h-8 text-xs flex-1 bg-muted/30 border-0 focus:ring-1 focus:ring-primary/30"
                                    />
                                  )
                                )}
                                <button
                                  onClick={() => removeAdvancedFilter(filter.id)}
                                  className="p-1.5 rounded text-muted-foreground opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Filter Button */}
                        <div className="p-3 border-t bg-muted/20">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs font-medium border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                            onClick={() => addFilterForColumn(col.key)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add Filter
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </Button>
              </div>

              {resizable && (
                <span
                  onMouseDown={startResize(col.key)}
                  className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize bg-transparent group-hover:bg-border"
                />
              )}
            </TableHead>
          );
        })}
        {(rowActions || quickActions) && (
          <TableHead className="w-[120px]">
            <span className="text-muted-foreground">Actions</span>
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
}
