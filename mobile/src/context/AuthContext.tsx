import { createContext, useContext, type ReactNode } from "react";

type AuthContextValue = {
  token: string;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  token,
  logout,
  children,
}: AuthContextValue & { children: ReactNode }) {
  return <AuthContext.Provider value={{ token, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
