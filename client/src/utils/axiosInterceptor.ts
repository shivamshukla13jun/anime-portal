import axios, { AxiosError } from "axios";
import { store } from "@/redux/store";
import { logout } from "@/redux/slices/UserSlice";
import { API_URL } from "@/config";
import { toast } from "react-toastify";
import {
  decryptErrorResponse,
  decryptResponse,
  encryptRequest,
} from "./aes";

const API_KEY = import.meta.env.VITE_API_KEY;

// 🔹 Axios Instance
const api = axios.create({
  baseURL: `${API_URL}api`,
  withCredentials: true,
  headers: {
    "x-api-key": API_KEY,
  },
});

// 🔹 Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const isEncrypted = true; // toggle encryption here
      // config.headers["isencrypted"] = String(isEncrypted);

      // if (isEncrypted) {
      //   encryptRequest(config);
      // }

      return config;
    } catch (error) {
      console.error("Request Interceptor Error:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// 🔹 Response Interceptor
api.interceptors.response.use(
  (response) => {
    try {
      // const isEncrypted = response.config.headers["isencrypted"] === "true";

      // if (isEncrypted) {
      //   decryptResponse(response);
      // }

      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Response Handling Error:", axiosError);
      // const isEncrypted = axiosError?.config?.headers?.["isencrypted"] === "true";

      // if (isEncrypted) {
      //   decryptErrorResponse(axiosError);
      // }

      return Promise.reject(axiosError);
    }
  },
  async (error) => {
    console.error("Response Interceptor Error:", error);

    // const isEncrypted = error?.config?.headers?.["isencrypted"] === "true";
    // if (isEncrypted) {
    //   decryptErrorResponse(error);
    // }

    const { response } = error;
    const message = response?.data?.message || error.message;

    switch (response?.status) {
      case 401:
        store.dispatch(logout());
        toast.error("Session expired. Please log in again.");
        error.message = "Session expired. Please log in again.";
        break;

      case 403:
        toast.error("Access denied.");
        error.message = "Access denied.";
        break;

      default:
        toast.error(message || "An unexpected error occurred.");
        error.message = message;
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
