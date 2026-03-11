import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata = {
  title: "Slanup — Squad Your Plans Up",
  description: "Create and join nearby plans with real people",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
