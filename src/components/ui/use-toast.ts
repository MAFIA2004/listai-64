
import { toast as sonnerToast } from "sonner";
import { type ReactNode } from "react";

type Toast = {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

// Create a function that extends the sonner toast with additional methods
const extendedToast = Object.assign(
  // Preserve the original function
  (message: ReactNode, data?: any) => sonnerToast(message, data),
  {
    // Add our custom methods
    ...sonnerToast,
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    warning: (message: string) => sonnerToast.error(message),
    info: (message: string) => sonnerToast.info(message),
  }
);

// Export the extended toast
export const toast = extendedToast;

export const useToast = () => {
  return { toast };
};
