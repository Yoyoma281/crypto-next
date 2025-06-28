import axios, { AxiosRequestConfig, Method } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AxiosOptions<TData = unknown> = {
  method?: Method;
  data?: TData;
  config?: AxiosRequestConfig;
};

export const LocalApiAxios = async <TResponse = unknown, TData = unknown>(
  endpoint: string,
  { method = 'GET', data, config }: AxiosOptions<TData> = {}
): Promise<TResponse> => {
  try {
    const response = await api.request<TResponse>({
      url: endpoint,
      method,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error('Axios error:', error);
    throw error;
  }
};
