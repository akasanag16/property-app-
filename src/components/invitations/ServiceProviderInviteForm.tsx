
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ServiceProviderInviteFormProps = {
  propertyId: string;
  onInviteSuccess?: () => void;
};

export function ServiceProviderInviteForm({ propertyId, onInviteSuccess }: ServiceProviderInviteFormProps) {
  const [email, setEmail] = useState("");
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
      console.log("Creating service provider invitation for:", { email, propertyId });
      const linkToken = crypto.randomUUID();
      
      // 1. Create the invitation in the database using RPC
      const { data: inviteData, error: inviteError } = await supabase.rpc('create_invitation', {
        p_property_id: propertyId,
        p_email: email,
        p_link_token: linkToken,
        p_type: 'service_provider'
      });

      if (inviteError) {
        console.error("Error creating service provider invitation:", inviteError);
        throw inviteError;
      }

      console.log("Service provider invitation created with ID:", inviteData);

      // 2. Generate and send invitation link
      const baseUrl = (await import("@/utils/urlUtils")).getInvitationBaseUrl();
      const { data, error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { 
          invitation_id: inviteData,
          invitation_type: 'service_provider',
          action: 'create',
          base_url: baseUrl
        },
      });

      if (sendError) {
        console.error("Error sending service provider invitation:", sendError);
        setEmailSendingFailed(true);
      }

      // Store magic link URL if provided
      if (data?.magic_link) {
        setInvitationUrl(data.magic_link);
      }

      toast.success(`Service provider invitation sent to ${email}`);
      setEmail("");
      if (onInviteSuccess) onInviteSuccess();

    } catch (error: any) {
      console.error("Error sending service provider invitation:", error);
      toast.error(`Failed to create invitation: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter service provider's email address"
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
            Creating Service Provider Invitation...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Invite Service Provider
          </span>
        )}
      </Button>

      {emailSendingFailed && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email Sending Failed</AlertTitle>
          <AlertDescription>
            The invitation was created but we couldn't send the email. 
            Please use the invitation link below to manually share with the service provider.
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
