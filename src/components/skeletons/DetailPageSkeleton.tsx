import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for detail pages like DeviceDetails and Android ApplicationDetails.
 * Mirrors: header with icon + title + badges, stat cards, tab strip, content area.
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex gap-6 items-start">
            <Skeleton className="w-24 h-24 rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-36" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="bg-card border rounded-lg p-1 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-md" />
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border p-6 space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
