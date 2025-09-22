import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginCitizen from "./pages/LoginCitizen";
import LoginAdmin from "@/pages/LoginAdmin";
import Register from "@/pages/Register";
import LoginSelection from "./pages/LoginSelection";
import RegisterSelection from "./pages/RegisterSelection";
import Unauthorized from "./pages/Unauthorized";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AccidentReportForm from "./components/forms/AccidentReportForm";
import RiskAlertForm from "./components/forms/RiskAlertForm";
import ProtectiveMeasureForm from "./components/protective-measures/ProtectiveMeasureForm";
import ReportForm from "./components/forms/ReportForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserApproval from "./pages/UserApproval";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<LoginSelection />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/login-citizen" element={<LoginCitizen />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-selection" element={<RegisterSelection />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/user-approval" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'master']}>
                <UserApproval />
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/citizen-dashboard" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'master']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/agent-dashboard" element={
            <ProtectedRoute allowedRoles={['agent', 'admin', 'master']}>
              <AgentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/accident-report" element={
            <ProtectedRoute allowedRoles={['citizen', 'agent', 'admin', 'master']}>
              <AccidentReportForm />
            </ProtectedRoute>
          } />
          <Route path="/risk-alert" element={
            <ProtectedRoute allowedRoles={['citizen', 'agent', 'admin', 'master']}>
              <RiskAlertForm />
            </ProtectedRoute>
          } />
          <Route path="/new-protective-measure" element={
            <ProtectedRoute allowedRoles={['agent', 'admin', 'master']}>
              <ProtectiveMeasureForm />
            </ProtectedRoute>
          } />
          <Route path="/new-report" element={
            <ProtectedRoute allowedRoles={['citizen', 'agent', 'admin', 'master']}>
              <ReportForm />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
