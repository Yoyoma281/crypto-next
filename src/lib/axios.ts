
import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_LOCAL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic request handler
export async function request<Res = unknown, Req = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  data?: Req,
  config?: AxiosRequestConfig
): Promise<Res> {
  try {
    const response = await api.request<Res>({
      url: endpoint,
      method,
      data,
      ...config,
    });
    console.log(`Request to ${endpoint} successful:`, response);
    return response.data;
  } catch (error) {
    console.error("Axios error:", error);
    throw error;
  }
}

// Export shortcuts for convenience
export const LocalApiAxios = {
  get: <Res = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
    request<Res>("GET", endpoint, undefined, config),

  post: <Res = unknown, Req = unknown>(
    endpoint: string,
    data?: Req,
    config?: AxiosRequestConfig
  ) => request<Res, Req>("POST", endpoint, data, config),

  put: <Res = unknown, Req = unknown>(
    endpoint: string,
    data?: Req,
    config?: AxiosRequestConfig
  ) => request<Res, Req>("PUT", endpoint, data, config),

  delete: <Res = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
    request<Res>("DELETE", endpoint, undefined, config),
};
