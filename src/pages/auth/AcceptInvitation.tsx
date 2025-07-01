
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvitationValidation } from "@/hooks/useInvitationValidation";
import { ValidationLoading, ValidationError } from "@/components/auth/InvitationValidationState";
import { ExistingAccountForm } from "@/components/auth/invitation/ExistingAccountForm";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AcceptInvitation() {
  const navigate = useNavigate();
  const { validating, isValid, error, invitationData } = useInvitationValidation();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [redirectSeconds, setRedirectSeconds] = useState<number>(10);

  // If we encounter a validation or submission error, show a timer to redirect back to login
  useEffect(() => {
    if (!validating && (!isValid || submissionError)) {
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 10000); // Redirect after 10 seconds
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setRedirectSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [validating, isValid, submissionError, navigate]);

  console.log("AcceptInvitation render state:", { validating, isValid, error, submissionError });

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
        <p className="mt-4 text-sm text-gray-500">
          Redirecting to login page in {redirectSeconds} seconds...
        </p>
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
              You will be redirected to the login page in {redirectSeconds} seconds.
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
          <CardTitle className="text-2xl font-bold">Connect to Property</CardTitle>
          <CardDescription>
            Sign in to your existing account to connect with the property
            {invitationData?.role && (
              <span className="block mt-1 font-medium">
                You'll be joining as a {invitationData.role.replace('_', ' ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Information alert for users without accounts */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-medium">Don't have an account yet?</p>
                <p>You'll need to create an account first using the regular signup process. After creating your account, you can return to this invitation link to connect with the property.</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-600 hover:text-blue-800"
                  onClick={() => navigate("/auth")}
                >
                  Go to Sign Up →
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <ExistingAccountForm 
            email={invitationData!.email}
            token={invitationData!.token}
            propertyId={invitationData!.propertyId}
            role={invitationData!.role}
            error=""
            setError={setSubmissionError}
            onBackToLogin={() => navigate("/auth")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
