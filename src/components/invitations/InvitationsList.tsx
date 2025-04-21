
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type InvitationType = "tenant" | "service_provider";

type Invitation = {
  id: string;
  email: string;
  created_at: string;
  is_used: boolean;
  expires_at: string;
};

type InvitationsListProps = {
  propertyId: string;
  type: InvitationType;
};

export function InvitationsList({ propertyId, type }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const tableName = type === "tenant" ? "tenant_invitations" : "service_provider_invitations";

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error(`Error fetching ${type} invitations:`, error);
      toast.error(`Failed to load ${type} invitations`);
    } finally {
      setLoading(false);
    }
  };

  // Delete invitation
  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setInvitations(invitations.filter(invite => invite.id !== id));
      toast.success("Invitation deleted successfully");
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast.error("Failed to delete invitation");
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchInvitations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `property_id=eq.${propertyId}`
        },
        (payload) => {
          // Refresh the list when data changes
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, tableName]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading invitations...</div>;
  }

  if (invitations.length === 0) {
    return <div className="text-center py-4 text-gray-500">No invitations found</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {type === "tenant" ? "Tenant" : "Service Provider"} Invitations
      </h3>
      
      <div className="space-y-2">
        {invitations.map((invitation) => (
          <div 
            key={invitation.id} 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
          >
            <div>
              <div className="font-medium">{invitation.email}</div>
              <div className="text-sm text-gray-500">
                {invitation.is_used ? (
                  <span className="text-green-600">Accepted</span>
                ) : (
                  <span>
                    Expires: {formatDate(invitation.expires_at)}
                  </span>
                )}
              </div>
            </div>
            
            {!invitation.is_used && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteInvitation(invitation.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
