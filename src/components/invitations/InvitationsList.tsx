
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
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, [propertyId, type]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(false);

      const { data, error: fetchError } = await supabase.rpc('get_property_invitations', {
        p_property_id: propertyId,
        p_type: type
      });

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
      setResendingId(id);
      
      // First, update the invitation expiry in the database directly without using the edge function
      const { error: updateError } = await supabase.rpc('update_invitation_expiry', {
        p_invitation_id: id,
        p_invitation_type: type
      });

      if (updateError) throw updateError;
      
      // Then, send the invitation email
      const baseUrl = window.location.origin;
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: { 
          invitation_id: id,
          invitation_type: type,
          action: 'resend',
          base_url: baseUrl
        },
      });

      if (emailError) {
        console.warn("Email sending failed but invitation was updated:", emailError);
        toast.warning("Invitation updated but email sending failed");
      } else {
        toast.success("Invitation resent successfully!");
      }
      
      fetchInvitations();
    } catch (err) {
      console.error("Error resending invitation:", err);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
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
          className="p-3 border border-indigo-100 rounded-md bg-gradient-to-r from-indigo-50/50 to-white flex justify-between items-center"
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
              disabled={resendingId === invitation.id}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              {resendingId === invitation.id ? (
                <span className="flex items-center gap-1">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </span>
              ) : "Resend"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
