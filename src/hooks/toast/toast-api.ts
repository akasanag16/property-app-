
import { toast as sonnerToast } from "sonner";
import { baseToast, Toast } from "./use-toast-base";

// Create a toast function that can be called directly
const toast = (props: Toast) => {
  return baseToast(props);
};

// Add helper methods to the toast function
toast.success = (message: string) => {
  baseToast({
    title: "Success",
    description: message,
    variant: "default"
  });
  sonnerToast.success(message);
};

toast.error = (message: string) => {
  baseToast({
    title: "Error",
    description: message,
    variant: "destructive"
  });
  sonnerToast.error(message);
};

toast.warning = (message: string) => {
  baseToast({
    title: "Warning",
    description: message,
    variant: "default"
  });
  sonnerToast.warning(message);
};

toast.info = (message: string) => {
  baseToast({
    title: "Info",
    description: message
  });
  sonnerToast.info(message);
};

export { toast };
