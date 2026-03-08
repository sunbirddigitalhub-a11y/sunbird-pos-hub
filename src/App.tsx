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
import { FeatureLock } from "@/components/FeatureLock";
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
import GrandmasterDashboard from "./pages/GrandmasterDashboard";
import UpgradePage from "./pages/UpgradePage";
import ReferralPage from "./pages/ReferralPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import AnalyticsPage from "./pages/AnalyticsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ExpensesPage from "./pages/ExpensesPage";
import SuppliersPage from "./pages/SuppliersPage";
import PurchasesPage from "./pages/PurchasesPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import StoresPage from "./pages/StoresPage";

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const defaultRoute = role === "staff" ? "/pos" : "/dashboard";

  return (
    <AppLayout>
      <Routes>
        {/* Redirect marketing/auth pages */}
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

        {/* Grandmaster */}
        <Route path="/grandmaster" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <GrandmasterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/subscriptions" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <SubscriptionManagement />
          </ProtectedRoute>
        } />

        {/* Core */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="dashboard"><Dashboard /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/pos" element={<FeatureLock feature="pos"><POS /></FeatureLock>} />
        <Route path="/products" element={<FeatureLock feature="products"><Products /></FeatureLock>} />
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="inventory"><Inventory /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="customers"><CustomersPage /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* Sales & Finance */}
        <Route path="/sales" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="sales"><Sales /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="invoices"><InvoicesPage /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="expenses"><ExpensesPage /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/outstanding" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="outstanding"><OutstandingBalances /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* Supply Chain */}
        <Route path="/suppliers" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="suppliers"><SuppliersPage /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/purchases" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="purchases"><PurchasesPage /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="reports"><Reports /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="analytics">
              <AnalyticsPage />
            </FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/z-report" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="zReport"><ZReport /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* Tools */}
        <Route path="/barcode" element={<FeatureLock feature="barcode"><BarcodePage /></FeatureLock>} />

        {/* Management */}
        <Route path="/staff-management" element={
          <ProtectedRoute allowedRoles={["master_admin", "supervisor"]}>
            <FeatureLock feature="staffManagement"><StaffManagementPage /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <FeatureLock feature="users"><UsersPage /></FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/stores" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <FeatureLock feature="stores"><StoresPage /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* System */}
        <Route path="/integrations" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <FeatureLock feature="integrations">
              <IntegrationsPage />
            </FeatureLock>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={["master_admin"]}>
            <FeatureLock feature="settings"><SettingsPage /></FeatureLock>
          </ProtectedRoute>
        } />

        {/* Upgrade & Referral */}
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/referral" element={<ReferralPage />} />

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
