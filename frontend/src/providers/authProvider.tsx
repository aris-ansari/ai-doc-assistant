"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useCallback, useContext } from "react";
import {
  getCurrentUser,
  login,
  logout,
  register,
  LoginInput,
  RegisterInput,
} from "@/lib/auth";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const signIn = useCallback(
    async (input: LoginInput) => {
      const user = await login(input);
      queryClient.setQueryData(["auth", "me"], user);
      return user;
    },
    [queryClient],
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const user = await register(input);
      queryClient.setQueryData(["auth", "me"], user);
      return user;
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await logout();
    queryClient.setQueryData(["auth", "me"], null);
  }, [queryClient]);

  const isAuthenticated = Boolean(userQuery.data);

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data ?? null,
        isLoading: userQuery.isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
