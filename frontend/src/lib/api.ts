import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
type RefreshSubscriber = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeToRefresh = (subscriber: RefreshSubscriber): void => {
  refreshSubscribers.push(subscriber);
};

const resolveRefresh = (): void => {
  refreshSubscribers.forEach(({ resolve }) => resolve());
  refreshSubscribers = [];
};

const rejectRefresh = (error: unknown): void => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToRefresh({
          resolve: () => {
            api(originalRequest).then(resolve).catch(reject);
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      await api.post("/auth/refresh", {});
      resolveRefresh();
      return api(originalRequest);
    } catch (refreshError) {
      rejectRefresh(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
