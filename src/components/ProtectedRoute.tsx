import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AppRole = "master_admin" | "supervisor" | "staff";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  grandmasterOnly?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, grandmasterOnly = false }: ProtectedRouteProps) {
  const { user, role, isGrandmaster, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (grandmasterOnly && !isGrandmaster) {
    if (role === "staff") return <Navigate to="/pos" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Grandmaster always has access
  if (isGrandmaster) return <>{children}</>;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === "staff") return <Navigate to="/pos" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
