
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Copy, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type InviteFormProps = {
  propertyId: string;
  onInviteSuccess?: () => void;
};

export function InviteForm({ propertyId, onInviteSuccess }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [inviteType, setInviteType] = useState<"tenant" | "service_provider">("tenant");
  const [loading, setLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [emailSendingFailed, setEmailSendingFailed] = useState(false);

  const copyToClipboard = () => {
    if (invitationUrl) {
      navigator.clipboard.writeText(invitationUrl);
      toast.success("Invitation link copied to clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    setInvitationUrl(null);
    setEmailSendingFailed(false);
    
    try {
      console.log("Creating invitation for:", { email, inviteType, propertyId });
      const linkToken = crypto.randomUUID();
      
      // 1. Create the invitation in the database using RPC
      const { data: inviteData, error: inviteError } = await supabase.rpc('create_invitation', {
        p_property_id: propertyId,
        p_email: email,
        p_link_token: linkToken,
        p_type: inviteType
      });

      if (inviteError) {
        console.error("Error creating invitation:", inviteError);
        throw inviteError;
      }

      console.log("Invitation created with ID:", inviteData);

      // 2. Generate and send invitation link
      const baseUrl = window.location.origin;
      const { data, error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { 
          invitation_id: inviteData,
          invitation_type: inviteType,
          action: 'create',
          base_url: baseUrl
        },
      });

      if (sendError) {
        console.error("Error sending invitation:", sendError);
        setEmailSendingFailed(true);
      }

      // Store magic link URL if provided
      if (data?.magic_link) {
        setInvitationUrl(data.magic_link);
      }

      toast.success(`Invitation created for ${email}`);
      setEmail("");
      if (onInviteSuccess) onInviteSuccess();

    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(`Failed to create invitation: ${error.message || "Unknown error"}`);
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
            Creating Invitation...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Create Invitation
          </span>
        )}
      </Button>

      {emailSendingFailed && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email Sending Failed</AlertTitle>
          <AlertDescription>
            The invitation was created but we couldn't send the email. 
            Please use the invitation link below to manually share with the recipient.
          </AlertDescription>
        </Alert>
      )}

      {invitationUrl && (
        <Alert className={`mt-4 ${emailSendingFailed ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <AlertDescription className={emailSendingFailed ? 'text-red-800' : 'text-blue-800'}>
            <div className="flex flex-col space-y-2">
              <span>Invitation link (you can share this manually):</span>
              <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200 text-sm overflow-hidden">
                <div className="truncate flex-1">{invitationUrl}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="flex-shrink-0 border-blue-200"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
