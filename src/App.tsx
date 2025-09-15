import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginCitizen from "./pages/LoginCitizen";
import LoginAdmin from "./pages/LoginAdmin";
import Register from "./pages/Register";
import LoginSelection from "./pages/LoginSelection";
import CitizenDashboard from "./pages/CitizenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AccidentReportForm from "./components/forms/AccidentReportForm";
import RiskAlertForm from "./components/forms/RiskAlertForm";
import ProtectiveMeasureForm from "./components/protective-measures/ProtectiveMeasureForm";
import ReportForm from "./components/forms/ReportForm";

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
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
          <Route path="/accident-report" element={<AccidentReportForm />} />
          <Route path="/risk-alert" element={<RiskAlertForm />} />
          <Route path="/new-protective-measure" element={
            <div className="min-h-screen bg-background py-8">
              <div className="container mx-auto px-4">
                <ProtectiveMeasureForm />
              </div>
            </div>
          } />
          <Route path="/new-report" element={
            <div className="min-h-screen bg-background py-8">
              <div className="container mx-auto px-4">
                <ReportForm />
              </div>
            </div>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
