import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import ZReport from "./pages/ZReport";
import CustomersPage from "./pages/CustomersPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import OutstandingBalances from "./pages/OutstandingBalances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Staff defaults to POS
  const defaultRoute = role === "staff" ? "/pos" : "/";

  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <Sales />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/z-report" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <ZReport />
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <CustomersPage />
          </ProtectedRoute>
        } />
        <Route path="/outstanding" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <OutstandingBalances />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
