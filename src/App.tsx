import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
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
import BarcodePage from "./pages/BarcodePage";
import NotFound from "./pages/NotFound";

// Website pages
import LandingPage from "./pages/website/LandingPage";
import FeaturesPage from "./pages/website/FeaturesPage";
import PricingPage from "./pages/website/PricingPage";
import AboutPage from "./pages/website/AboutPage";
import ContactPage from "./pages/website/ContactPage";
import IndustriesPage from "./pages/website/IndustriesPage";
import RegisterPage from "./pages/website/RegisterPage";
import ForgotPasswordPage from "./pages/website/ForgotPasswordPage";
import ResetPasswordPage from "./pages/website/ResetPasswordPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Routes>
        {/* Marketing website */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/industries" element={<IndustriesPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Catch-all for unauthenticated */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Staff defaults to POS
  const defaultRoute = role === "staff" ? "/pos" : "/dashboard";

  return (
    <AppLayout>
      <Routes>
        {/* Redirect marketing/auth pages to POS for logged-in users */}
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/register" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/features" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/pricing" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/about" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/contact" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/industries" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/forgot-password" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/reset-password" element={<Navigate to={defaultRoute} replace />} />

        {/* POS Routes — unchanged */}
        <Route path="/dashboard" element={
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
        <Route path="/barcode" element={<BarcodePage />} />
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
            <SubscriptionProvider>
              <AppRoutes />
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
