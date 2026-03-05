import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for PolicyConfigurationPage.
 * Mirrors: title bar, large card with form fields.
 */
export function PolicyConfigSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Skeleton className="h-7 w-52" />

      {/* Card */}
      <div className="bg-card rounded-xl border border-t-4 border-t-primary shadow-md">
        <div className="p-6 space-y-2 border-b">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="p-6 space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
