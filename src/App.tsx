import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminClients from "./pages/admin/Clients";
import AdminCarers from "./pages/admin/Carers";
import AdminSchedules from "./pages/admin/Schedules";
import AdminLeave from "./pages/admin/Leave";
import CarerDashboard from "./pages/carer/Dashboard";
import CarerSchedules from "./pages/carer/Schedules";
import CarerLeave from "./pages/carer/Leave";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminClients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/carers"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCarers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leave"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLeave />
                </ProtectedRoute>
              }
            />

            {/* Carer Routes */}
            <Route
              path="/carer"
              element={
                <ProtectedRoute requireCarer>
                  <CarerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carer/schedules"
              element={
                <ProtectedRoute requireCarer>
                  <CarerSchedules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carer/leave"
              element={
                <ProtectedRoute requireCarer>
                  <CarerLeave />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
