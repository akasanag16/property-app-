
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceProviderPropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-36 mb-3" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
