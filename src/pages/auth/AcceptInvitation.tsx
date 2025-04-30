
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvitationValidation } from "@/hooks/useInvitationValidation";
import { InvitationAcceptanceForm } from "@/components/auth/InvitationAcceptanceForm";
import { ValidationLoading, ValidationError } from "@/components/auth/InvitationValidationState";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const { validating, isValid, error, invitationData } = useInvitationValidation();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // If we encounter a validation or submission error, show a timer to redirect back to login
  useEffect(() => {
    if (!validating && (!isValid || submissionError)) {
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 10000); // Redirect after 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [validating, isValid, submissionError, navigate]);

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

  if (submissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Invitation Error</CardTitle>
            <CardDescription>
              There was a problem processing your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{submissionError}</AlertDescription>
            </Alert>
            <p className="mt-4 text-sm text-gray-500 text-center">
              You will be redirected to the login page in a few seconds.
              If you already have an account, you can sign in there.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
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
