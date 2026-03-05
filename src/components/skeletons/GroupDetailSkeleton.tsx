import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for GroupDetails page.
 * Mirrors: group title + description, add button, members table.
 */
export function GroupDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 space-y-2">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="px-6 pb-4">
          <Skeleton className="h-9 w-64 rounded-md" />
        </div>
        <div className="border-t">
          {/* Table Header */}
          <div className="flex gap-4 p-4 border-b bg-muted/50">
            {["w-32", "w-24", "w-24", "w-20", "w-16"].map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
          </div>
          {/* Table Rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b last:border-0 items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-md ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
