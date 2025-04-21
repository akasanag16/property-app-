
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

type InviteFormProps = {
  propertyId: string;
  onInviteSuccess?: () => void;
};

export function InviteForm({ propertyId, onInviteSuccess }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [inviteType, setInviteType] = useState<"tenant" | "service_provider">("tenant");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Generate a unique link token
      const linkToken = crypto.randomUUID();
      
      // Choose the right table based on invite type
      const table = inviteType === "tenant" ? "tenant_invitations" : "service_provider_invitations";
      
      // Insert the invitation into the database
      const { error: inviteError } = await supabase
        .from(table)
        .insert({
          property_id: propertyId,
          email,
          link_token: linkToken,
        });

      if (inviteError) throw inviteError;

      // Create a notification for the property owner
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('name, owner_id')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      // Using rpc for inserting notification to avoid type issues
      const { error: notificationError } = await supabase
        .rpc('create_notification', {
          user_id_param: propertyData.owner_id,
          title_param: `New ${inviteType} Invitation Sent`,
          message_param: `Invitation sent to ${email} for property "${propertyData.name}"`,
          type_param: 'invitation_sent',
          related_entity_id_param: propertyId,
          related_entity_type_param: 'property'
        })
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          return { error: null };
        })
        .catch(err => {
          console.error('Error in create_notification RPC:', err);
          
          // Fallback to raw SQL if the RPC doesn't exist yet
          return supabase.from('notifications')
            .insert({
              user_id: propertyData.owner_id,
              title: `New ${inviteType} Invitation Sent`,
              message: `Invitation sent to ${email} for property "${propertyData.name}"`,
              type: 'invitation_sent',
              related_entity_id: propertyId,
              related_entity_type: 'property'
            });
        });

      if (notificationError) throw notificationError;
      
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      if (onInviteSuccess) onInviteSuccess();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inviteType">Invite as</Label>
        <Select 
          value={inviteType} 
          onValueChange={(value) => setInviteType(value as "tenant" | "service_provider")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role to invite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Invitation
          </span>
        )}
      </Button>
    </form>
  );
}
