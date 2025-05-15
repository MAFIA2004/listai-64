
import { toast as sonnerToast } from "sonner";

type Toast = {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

// Extender el toast original de sonner con métodos adicionales
export const toast: typeof sonnerToast & Toast = {
  ...sonnerToast,
  success: (message) => sonnerToast.success(message),
  error: (message) => sonnerToast.error(message),
  warning: (message) => sonnerToast.error(message),
  info: (message) => sonnerToast.info(message),
};

export const useToast = () => {
  return { toast };
};
