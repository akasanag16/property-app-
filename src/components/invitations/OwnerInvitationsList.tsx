
import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnerInvitation } from "@/hooks/invitations/useOwnerInvitations";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Building, Mail, RefreshCw } from "lucide-react";

interface OwnerInvitationsListProps {
  invitations: OwnerInvitation[];
  loading: boolean;
  error: string | null;
  resendingId: string | null;
  title: string;
  emptyMessage: string;
  onResend: (id: string) => Promise<void>;
}

// InvitationItem component to optimize rendering
const InvitationItem = memo(({ 
  invitation, 
  resendingId,
  onResend 
}: { 
  invitation: OwnerInvitation;
  resendingId: string | null;
  onResend: (id: string) => Promise<void>;
}) => {
  return (
    <div
      key={invitation.id}
      className="p-3 border border-indigo-100 rounded-md bg-white hover:shadow-sm transition-shadow flex flex-col md:flex-row md:justify-between md:items-center gap-3"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-500" />
          <p className="font-medium text-gray-800">{invitation.email}</p>
          <Badge
            variant={invitation.status === "accepted" ? "success" : "default"}
            className={
              invitation.status === "accepted"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-indigo-100 text-indigo-800"
            }
          >
            {invitation.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Building className="h-3 w-3" />
          <span>Property: {invitation.propertyName}</span>
        </div>
        <p className="text-xs text-gray-500">
          Sent {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
        </p>
      </div>

      {invitation.status === "pending" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResend(invitation.id)}
          disabled={resendingId === invitation.id}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 ml-auto"
        >
          {resendingId === invitation.id ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Sending...
            </span>
          ) : (
            "Resend"
          )}
        </Button>
      )}
    </div>
  );
});

InvitationItem.displayName = "InvitationItem";

export const OwnerInvitationsList = memo(function OwnerInvitationsList({
  invitations,
  loading,
  error,
  resendingId,
  title,
  emptyMessage,
  onResend,
}: OwnerInvitationsListProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-white border-red-100">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50/40 to-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <InvitationItem 
              key={invitation.id} 
              invitation={invitation} 
              resendingId={resendingId}
              onResend={onResend}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
