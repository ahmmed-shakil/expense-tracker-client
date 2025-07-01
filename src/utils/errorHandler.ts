import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "./api";

export const useApiErrorHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // console.error("API Error:", error.response?.data || error.message);

        // Handle specific errors that aren't 401 (401 is handled by the main interceptor)
        if (error.response?.status === 403) {
          toast.error("You don't have permission to perform this action.");
        } else if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        }

        return Promise.reject(error);
      }
    );

    // Cleanup function to remove interceptor
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);
};

// Utility function to handle API errors with specific messages
export const handleApiError = (error: any, operation: string = "operation") => {
  // console.error(`Failed to ${operation}:`, error);

  if (error.code === "ERR_NETWORK") {
    toast.error("Unable to connect to server. Please check your connection.");
  } else if (error.response?.status === 401) {
    // 401 errors are handled by the interceptor, don't show duplicate messages
    return;
  } else if (error.response?.status === 403) {
    toast.error("You don't have permission to perform this action.");
  } else if (error.response?.status === 404) {
    toast.error("Resource not found.");
  } else if (error.response?.status >= 500) {
    toast.error("Server error. Please try again later.");
  } else if (error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else {
    toast.error(`Failed to ${operation}. Please try again.`);
  }
};
