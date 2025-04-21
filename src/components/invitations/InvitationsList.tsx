
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

      const tableName = type === "tenant" ? "tenant_invitations" : "service_provider_invitations";
      
      // Direct query to the invitation table instead of using RPC function
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

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
        body: { 
          action: "resend", 
          invitation_id: id,
          invitation_type: type
        },
      });

      if (error) throw error;
      
      toast.success("Invitation resent successfully!");
      // Refresh the list to show updated status
      fetchInvitations();
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
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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
          className="p-3 border border-indigo-100 rounded-md bg-white flex justify-between items-center"
        >
          <div>
            <p className="font-medium text-gray-800">{invitation.email}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                Sent {new Date(invitation.created_at).toLocaleDateString()}
              </p>
              {invitation.status && (
                <Badge variant={invitation.status === "accepted" ? "success" : "default"} className={
                  invitation.status === "accepted" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                }>
                  {invitation.status}
                </Badge>
              )}
            </div>
          </div>
          {invitation.status === "pending" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleResendInvitation(invitation.id)}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              Resend
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
