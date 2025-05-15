
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { useToast } from "@/components/ui/use-toast";

// Re-export for backward compatibility
export { useToast };

// Wrapper for the toast function that uses the shadcn/ui toast
export const toast = {
  success: (message: string) => {
    useToast().toast({
      title: "Success",
      description: message,
      variant: "default"
    });
    sonnerToast.success(message);
  },
  error: (message: string) => {
    useToast().toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
    sonnerToast.error(message);
  },
  warning: (message: string) => {
    useToast().toast({
      title: "Warning",
      description: message,
      variant: "default"
    });
    sonnerToast.warning(message);
  },
  info: (message: string) => {
    useToast().toast({
      title: "Info",
      description: message
    });
    sonnerToast.info(message);
  },
  // Forward any other toast calls to the shadcn/ui toast
  ...useToast()
};
