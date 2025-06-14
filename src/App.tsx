
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/nursing-homes" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Nursing Homes</h1>
                <p className="text-muted-foreground">Manage your care facilities here.</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/residents" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Resident Management</h1>
                <p className="text-muted-foreground">Onboard and manage residents across all facilities.</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/finances" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Financial Tracking</h1>
                <p className="text-muted-foreground">Track income and expenses for residents and facilities.</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/reports" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Reports</h1>
                <p className="text-muted-foreground">Generate comprehensive financial and operational reports.</p>
              </div>
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">System Settings</h1>
                <p className="text-muted-foreground">Configure system preferences and security settings.</p>
              </div>
            </DashboardLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
