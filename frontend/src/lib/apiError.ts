import axios from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;
    if (message) return message;

    const validationError = error.response?.data?.errors?.[0];
    if (validationError) return validationError;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
