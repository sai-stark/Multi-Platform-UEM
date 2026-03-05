import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for GeofenceEditor and similar form + map pages.
 * Mirrors: title + subtitle, side-by-side form card + map placeholder.
 */
export function FormEditorSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-card rounded-xl border p-6 space-y-5 lg:col-span-1">
          <Skeleton className="h-5 w-20" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-xl border overflow-hidden h-[600px]">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      </div>
    </div>
  );
}
