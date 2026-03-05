import React from "react";
import {
  Search,
  Filter,
  Columns,
  ChevronDown,
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Column } from "./types";
import { UseDataTableReturn } from "./useDataTable";

interface DataTableToolbarProps<T> {
  table: UseDataTableReturn<T>;
  globalSearch?: boolean;
  globalSearchPlaceholder?: string;
  filterable?: boolean;
  showColumnToggle?: boolean;
  showExport?: boolean;
  columns: Column<T>[];
}

export function DataTableToolbar<T extends Record<string, any>>({
  table,
  globalSearch = true,
  globalSearchPlaceholder = "Search...",
  filterable = true,
  showColumnToggle = true,
  showExport = false,
  columns,
}: DataTableToolbarProps<T>) {
  const {
    searchTerm,
    searchColumns,
    setSearchTerm,
    setSearchColumns,
    handleSearch,
    advancedFilters,
    removeAllAdvancedFilters,
    visibleColumns,
    toggleColumn,
    handleExportPDF,
    handleExportCSV,
  } = table;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Global Search with Multi-Select Columns */}
      {globalSearch && (
        <div className="flex flex-1 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`w-[180px] justify-between transition-all ${
                  !searchColumns.has("all") && searchColumns.size > 0
                    ? "border-primary/50 text-primary"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="truncate">
                    {searchColumns.has("all")
                      ? "All Columns"
                      : searchColumns.size === 0
                      ? "Select columns"
                      : searchColumns.size === 1
                      ? columns.find((c) => searchColumns.has(c.key))?.header || "1 column"
                      : `${searchColumns.size} columns`}
                  </span>
                </div>
                {!searchColumns.has("all") && searchColumns.size > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                    {searchColumns.size}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <div className="p-2 border-b bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Search in columns</p>
                {!searchColumns.has("all") && (
                  <button
                    onClick={() => setSearchColumns(new Set(["all"]))}
                    className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto">
                {/* All Columns Option */}
                <button
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    searchColumns.has("all")
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSearchColumns(new Set(["all"]));
                  }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    searchColumns.has("all")
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {searchColumns.has("all") && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  All Columns
                </button>
                
                <div className="border-t my-2" />
                
                {/* Individual Columns */}
                {columns
                  .filter((col) => col.searchable)
                  .map((col) => (
                    <button
                      key={col.key}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                        searchColumns.has(col.key)
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        setSearchColumns((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("all");
                          
                          if (newSet.has(col.key)) {
                            newSet.delete(col.key);
                            if (newSet.size === 0) {
                              newSet.add("all");
                            }
                          } else {
                            newSet.add(col.key);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        searchColumns.has(col.key)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      }`}>
                        {searchColumns.has(col.key) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      {col.header}
                    </button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                searchColumns.has("all")
                  ? globalSearchPlaceholder
                  : searchColumns.size === 1
                  ? `Search ${columns.find((c) => searchColumns.has(c.key))?.header || ""}...`
                  : `Search in ${searchColumns.size} columns...`
              }
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-9"
              aria-label={globalSearchPlaceholder}
            />
            {(searchTerm || !searchColumns.has("all")) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchColumns(new Set(["all"]));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {filterable && (
        <Button
          variant="outline"
          size="sm"
          disabled={advancedFilters.length === 0}
          onClick={removeAllAdvancedFilters}
          className={`transition-all duration-200 ${
            advancedFilters.length > 0 
              ? "border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive" 
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear
          {advancedFilters.length > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
              {advancedFilters.length}
            </span>
          )}
        </Button>
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
  );
}
