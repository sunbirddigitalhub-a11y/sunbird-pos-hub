import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AppRole = "master_admin" | "supervisor" | "staff";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Staff goes to POS, others go to dashboard
    if (role === "staff") return <Navigate to="/pos" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
