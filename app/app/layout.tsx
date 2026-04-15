import { AuthProvider } from "@/lib/context/AuthContext";
import ProfileGate from "@/components/ProfileGate";
import MobileAppRedirect from "@/components/MobileAppRedirect";

export const metadata = {
  title: "Slanup — Squad Your Plans Up",
  description: "Create and join nearby plans with real people",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MobileAppRedirect />
      <ProfileGate>
        {children}
      </ProfileGate>
    </AuthProvider>
  );
}
