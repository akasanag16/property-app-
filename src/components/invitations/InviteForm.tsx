
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
      const linkToken = crypto.randomUUID();
      
      const { error: inviteError } = await supabase.rpc('create_invitation', {
        p_property_id: propertyId,
        p_email: email,
        p_link_token: linkToken,
        p_type: inviteType
      });

      if (inviteError) throw inviteError;

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
          <SelectTrigger id="inviteType" className="bg-white border-indigo-100">
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
          className="bg-white border-indigo-100"
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
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
