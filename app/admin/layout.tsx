"use client";

import { AuthProvider } from "@/lib/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
