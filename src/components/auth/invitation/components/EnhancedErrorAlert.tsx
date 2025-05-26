
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Info } from "lucide-react";
import { ApiError, getErrorMessage, shouldShowRetry } from "../utils/errorHandling";

interface EnhancedErrorAlertProps {
  error: ApiError;
  onRetry?: () => void;
  onClear?: () => void;
}

export function EnhancedErrorAlert({ error, onRetry, onClear }: EnhancedErrorAlertProps) {
  const userMessage = getErrorMessage(error);
  const canRetry = shouldShowRetry(error) && onRetry;
  
  // Determine alert variant based on error type
  const isWarning = error.message.includes('already exists') || error.message.includes('already been registered');
  
  return (
    <Alert variant={isWarning ? "default" : "destructive"} className="border-l-4">
      {isWarning ? (
        <Info className="h-4 w-4 text-blue-600" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle className="font-semibold">
        {isWarning ? 'Account Already Exists' : 'Error'}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{userMessage}</p>
        
        {error.code && (
          <p className="text-sm text-muted-foreground">
            Error code: {error.code}
          </p>
        )}
        
        <div className="flex gap-2">
          {canRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
          {onClear && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClear}
              className="h-8 text-muted-foreground"
            >
              Dismiss
            </Button>
          )}
        </div>
        
        {isWarning && (
          <p className="text-sm text-muted-foreground">
            💡 Tip: Use the "I already have an account" option below to sign in with your existing credentials.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
