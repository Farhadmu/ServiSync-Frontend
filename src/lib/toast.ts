import { toast } from "sonner";
import { formatApiError } from "./api-client";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (err: unknown, fallbackMessage = "An unexpected error occurred") => {
    const errorMsg = formatApiError(err);
    toast.error(errorMsg || fallbackMessage, {
      duration: 6000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  backendColdStart: () => {
    toast.info("Connecting to live backend...", {
      description: "Render free instances spin down on inactivity. Waking up server, please hold on.",
      duration: 10000,
    });
  },
};
