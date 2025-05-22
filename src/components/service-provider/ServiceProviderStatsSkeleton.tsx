
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceProviderStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
