"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getStoredUser, getStoredToken, storeAuth, clearAuth, api } from "@/lib/api/client";

type User = Record<string, unknown> | null;

interface AuthContextType {
  user: User;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isNewUser: boolean;
  login: (accessToken: string, refreshToken: string, user: Record<string, unknown>, isNew: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsNewUser(!storedUser.name);
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: Record<string, unknown>, isNew: boolean) => {
    storeAuth(accessToken, refreshToken, userData);
    setToken(accessToken);
    setUser(userData);
    setIsNewUser(isNew);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    setIsNewUser(false);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem('slanup_user', JSON.stringify(userData));
      setIsNewUser(!userData.name);
    } catch {
      // Token might be invalid
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isLoggedIn: !!token,
      isNewUser,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
