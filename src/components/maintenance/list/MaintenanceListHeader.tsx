
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ArrowDownAZ } from "lucide-react";
import { SortOption } from "@/hooks/maintenance/useMaintenanceRequestSorting";

type MaintenanceListHeaderProps = {
  requestCount: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
};

export function MaintenanceListHeader({ 
  requestCount, 
  sortBy, 
  onSortChange 
}: MaintenanceListHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-500">{requestCount} requests</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Newest first
            </SelectItem>
            <SelectItem value="date-asc">
              <Calendar className="mr-2 h-4 w-4" /> Oldest first
            </SelectItem>
            <SelectItem value="status">By status</SelectItem>
            <SelectItem value="priority">
              <ArrowDownAZ className="mr-2 h-4 w-4" /> Property name
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
