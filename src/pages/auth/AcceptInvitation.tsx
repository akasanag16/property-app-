
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvitationValidation } from "@/hooks/useInvitationValidation";
import { InvitationAcceptanceForm } from "@/components/auth/InvitationAcceptanceForm";
import { ValidationLoading, ValidationError } from "@/components/auth/InvitationValidationState";
import { useNavigate } from "react-router-dom";

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const { validating, isValid, error, invitationData } = useInvitationValidation();

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ValidationLoading />
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ValidationError error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
          <CardDescription>
            Create your account to access the property management portal
            {invitationData?.role && (
              <span className="block mt-1 font-medium">
                You'll be joining as a {invitationData.role.replace('_', ' ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationAcceptanceForm {...invitationData!} />
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
            I already have an account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
