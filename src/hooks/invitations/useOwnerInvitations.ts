
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export type InvitationType = "tenant" | "service_provider";

export interface OwnerInvitation {
  id: string;
  email: string;
  propertyId: string;
  propertyName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  linkToken: string;
}

export function useOwnerInvitations(
  user: User | null,
  type: InvitationType,
  refreshKey: number = 0
) {
  const [invitations, setInvitations] = useState<OwnerInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitations() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching ${type} invitations for owner: ${user.id}`);
        const { data, error } = await supabase.rpc("get_owner_invitations", {
          owner_id_param: user.id,
          invitation_type: type,
        });

        if (error) {
          console.error(`Error fetching ${type} invitations:`, error);
          throw error;
        }

        if (!data) {
          console.log(`No ${type} invitations found`);
          setInvitations([]);
          return;
        }

        console.log(`Found ${data.length} ${type} invitations:`, data);
        
        // Map the data to our client-side format
        const formattedInvitations = data.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          propertyId: inv.property_id,
          propertyName: inv.property_name,
          status: inv.status,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          linkToken: inv.link_token,
        }));

        setInvitations(formattedInvitations);
      } catch (err: any) {
        console.error(`Error in ${type} invitations fetch:`, err);
        setError(err.message || `Failed to load ${type} invitations`);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, [user, type, refreshKey]);

  const handleResendInvitation = async (id: string) => {
    try {
      setResendingId(id);
      
      // Update the invitation expiry in the database
      const { error: updateError } = await supabase.rpc("update_invitation_expiry", {
        p_invitation_id: id,
        p_invitation_type: type,
      });

      if (updateError) throw updateError;
      
      // Send the invitation email
      const baseUrl = window.location.origin;
      const { error: emailError } = await supabase.functions.invoke("send-invitation", {
        body: { 
          invitation_id: id,
          invitation_type: type,
          action: "resend",
          base_url: baseUrl,
        },
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("Invitation updated but email sending failed. Please try again later.");
      } else {
        toast.success("Invitation resent successfully!");
      }
      
      // Refresh invitations list with updated data
      const { data: refreshData, error: refreshError } = await supabase.rpc("get_owner_invitations", {
        owner_id_param: user?.id,
        invitation_type: type,
      });
      
      if (!refreshError && refreshData) {
        const formattedInvitations = refreshData.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          propertyId: inv.property_id,
          propertyName: inv.property_name,
          status: inv.status,
          createdAt: inv.created_at,
          expiresAt: inv.expires_at,
          linkToken: inv.link_token,
        }));
        
        setInvitations(formattedInvitations);
      }
    } catch (err: any) {
      console.error("Error resending invitation:", err);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  return {
    invitations,
    loading,
    error,
    resendingId,
    handleResendInvitation,
  };
}
