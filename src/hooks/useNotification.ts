
import { toast } from "sonner";

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useNotification = () => {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    toast.success(options?.title || "Success", {
      description: message,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const showError = (message: string, options?: NotificationOptions) => {
    toast.error(options?.title || "Error", {
      description: message,
      duration: options?.duration || 6000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const showWarning = (message: string, options?: NotificationOptions) => {
    toast.warning(options?.title || "Warning", {
      description: message,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  const showInfo = (message: string, options?: NotificationOptions) => {
    toast.info(options?.title || "Info", {
      description: message,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
