
import React from 'react';
import { Button } from "@/components/ui/button";

type ActionButtonsProps = {
  status: string;
  userRole: "owner" | "tenant" | "service_provider";
  onAccept: () => void;
  onComplete: () => void;
};

export function ActionButtons({ status, userRole, onAccept, onComplete }: ActionButtonsProps) {
  // Tenants can't update status
  if (userRole === "tenant") {
    return null;
  }

  return (
    <div className="flex justify-end gap-2 w-full">
      {status === "pending" && (
        <Button
          onClick={onAccept}
          variant="outline"
          size="sm"
        >
          {userRole === "owner" ? "Mark In Progress" : "Accept Request"}
        </Button>
      )}
      
      {status === "accepted" && (
        <Button
          onClick={onComplete}
          variant="outline" 
          size="sm"
        >
          Mark Completed
        </Button>
      )}
    </div>
  );
}
