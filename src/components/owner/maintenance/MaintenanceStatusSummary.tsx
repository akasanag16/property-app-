
import { MaintenanceStatusCard } from "./MaintenanceStatusCard";

type MaintenanceStatusSummaryProps = {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
};

export function MaintenanceStatusSummary({ 
  pendingCount, 
  inProgressCount, 
  completedCount 
}: MaintenanceStatusSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MaintenanceStatusCard
        title="Pending"
        description="New requests"
        count={pendingCount}
        color="text-amber-500"
      />
      
      <MaintenanceStatusCard
        title="In Progress"
        description="Currently being addressed"
        count={inProgressCount}
        color="text-blue-500"
      />
      
      <MaintenanceStatusCard
        title="Completed"
        description="Resolved issues"
        count={completedCount}
        color="text-green-500"
      />
    </div>
  );
}
