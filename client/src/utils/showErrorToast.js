import { toast } from "react-toastify";

export function showErrorToast(error) {
  toast.error(
    error.response?.data?.message || "Something went wrong."
  );
}