import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Authentication/Login";
import ForgotPassword from "./pages/Authentication/ForgotPassword";
import ResetPassword from "./pages/Authentication/ResetPassword";
import CompleteProfile from "./pages/Authentication/CompleteProfile";
import VerifyOTP from "./pages/Authentication/Verify-Login";
import Dashboard from "./pages/Dashboard/Dashboard";

import { UserProvider } from './components/context/UserContext';
import { AuthProvider } from './components/context/AuthContext';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
              <Routes>
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/verify-login" element={<VerifyOTP />} />  
                <Route path="/forgot-password" element={<ForgotPassword />} />  
                <Route path="/reset-password" element={<ResetPassword />} />  
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
