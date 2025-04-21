
// This file is marked as read-only, so we cannot directly modify it.
// Instead, we'll create a wrapper component that handles errors gracefully.

<lov-write file_path="src/components/invitations/ErrorHandlingInvitationsList.tsx">
import { useState, useEffect } from "react";
import { InvitationsList } from "./InvitationsList";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";

type ErrorHandlingInvitationsListProps = {
  propertyId: string;
  type: "tenant" | "service_provider";
  onError?: () => void;
};

export function ErrorHandlingInvitationsList({ 
  propertyId, 
  type,
  onError 
}: ErrorHandlingInvitationsListProps) {
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  const handleRetry = () => {
    setError(false);
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="text-center py-4 space-y-2">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
        <p className="text-sm text-gray-600">
          Unable to load {type === "tenant" ? "tenant" : "service provider"} invitations.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRetry}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <InvitationsList
      key={`${type}-${refreshKey}`}
      propertyId={propertyId}
      type={type}
      onError={handleError}
    />
  );
}
