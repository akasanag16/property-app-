
import { Skeleton } from "@/components/ui/skeleton";
import { GradientCard } from "@/components/ui/gradient-card";

export function TenantStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <GradientCard key={i} gradient="purple">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </GradientCard>
      ))}
    </div>
  );
}

export function TenantPropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <GradientCard key={i} gradient="blue">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-64 mb-4" />
          <Skeleton className="h-4 w-40" />
        </GradientCard>
      ))}
    </div>
  );
}

export function TenantMaintenanceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GradientCard gradient="purple">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </GradientCard>
      
      <GradientCard gradient="blue">
        <Skeleton className="h-7 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </GradientCard>
    </div>
  );
}
