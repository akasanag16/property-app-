
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type InvitationsListProps = {
  propertyId: string;
  type: "tenant" | "service_provider";
  onError?: () => void;
};

export function InvitationsList({ propertyId, type, onError }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, [propertyId, type]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(false);

      // Determine which table to query based on the type
      const tableName = type === "tenant" ? "tenant_invitations" : "service_provider_invitations";
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (err) {
      console.error(`Error fetching ${type} invitations:`, err);
      setError(true);
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke("handle-invitation", {
        method: "POST",
        body: { action: "resend", invitation_id: id },
      });

      if (error) throw error;
      
      toast.success("Invitation resent successfully!");
    } catch (err) {
      console.error("Error resending invitation:", err);
      toast.error("Failed to resend invitation");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading invitations...</div>;
  }

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
          onClick={fetchInvitations}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No {type === "tenant" ? "tenant" : "service provider"} invitations yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div 
          key={invitation.id} 
          className="p-3 border border-purple-100 rounded-md bg-white flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-gray-800">{invitation.email}</p>
            <p className="text-xs text-gray-500">
              Sent {new Date(invitation.created_at).toLocaleDateString()}
              {invitation.status !== "pending" && ` • ${invitation.status}`}
            </p>
          </div>
          {invitation.status === "pending" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleResendInvitation(invitation.id)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              Resend
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
