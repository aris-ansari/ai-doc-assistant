import api from "./api";
import type { ApiResponse, AuthPayload, User } from "./types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<AuthPayload>>("/auth/me");
  return response.data.data.user;
};

export const login = async (input: LoginInput): Promise<User> => {
  const response = await api.post<ApiResponse<AuthPayload>>("/auth/login", input);
  return response.data.data.user;
};

export const register = async (input: RegisterInput): Promise<User> => {
  const response = await api.post<ApiResponse<AuthPayload>>("/auth/register", input);
  return response.data.data.user;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
