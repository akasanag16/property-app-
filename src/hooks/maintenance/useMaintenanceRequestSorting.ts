
import { useState, useEffect } from "react";
import { MaintenanceRequest } from "@/types/maintenance";

export type SortOption = "date-desc" | "date-asc" | "status" | "priority";

export function useMaintenanceRequestSorting(requests: MaintenanceRequest[] | undefined) {
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [sortedRequests, setSortedRequests] = useState<MaintenanceRequest[]>([]);

  // Apply sorting when requests or sort method changes
  useEffect(() => {
    if (!requests) {
      setSortedRequests([]);
      return;
    }

    let result = [...requests];

    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "date-asc":
        result.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "status":
        // Sort by priority: pending first, then accepted, then completed
        result.sort((a, b) => {
          const statusWeight = { pending: 0, accepted: 1, completed: 2 };
          return statusWeight[a.status as keyof typeof statusWeight] - 
                 statusWeight[b.status as keyof typeof statusWeight];
        });
        break;
      case "priority":
        // Sort by property name
        result.sort((a, b) => 
          a.property.name.localeCompare(b.property.name));
        break;
    }

    setSortedRequests(result);
  }, [requests, sortBy]);

  return { sortedRequests, sortBy, setSortBy };
}
