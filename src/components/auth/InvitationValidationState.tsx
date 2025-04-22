
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ValidationLoadingProps {
  title?: string;
  description?: string;
}

export function ValidationLoading({ 
  title = "Validating Invitation",
  description = "Please wait while we validate your invitation"
}: ValidationLoadingProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

interface ValidationErrorProps {
  error: string;
}

export function ValidationError({ error }: ValidationErrorProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Invalid Invitation</CardTitle>
        <CardDescription>There was a problem with your invitation link</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
