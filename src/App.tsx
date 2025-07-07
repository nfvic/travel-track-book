
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "@/layouts/MainLayout";
import PassengerDashboard from "./pages/PassengerDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import QRScanner from "./pages/QRScanner";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthGate from "@/components/AuthGate";
import Profile from "./pages/Profile";
import MyTickets from "@/pages/MyTickets";
import AdminDashboard from "./pages/AdminDashboard";
import TicketPage from "@/pages/Ticket";
import PaymentSuccess from "./pages/PaymentSuccess";
import { ThemeProvider } from "@/contexts/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Profile page: for signed-in users */}
              <Route
                path="/profile"
                element={
                  <AuthGate role={null}>
                    <Profile />
                  </AuthGate>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <AuthGate role="passenger">
                    <MyTickets />
                  </AuthGate>
                }
              />
              {/* New: digital ticket post-payment page */}
              <Route
                path="/ticket/:bookingId"
                element={
                  <AuthGate role="passenger">
                    <TicketPage />
                  </AuthGate>
                }
              />
           {/* Stripe success page: robust polling and redirect */}
           <Route path="/payment-success" element={<PaymentSuccess />} />
              {/* Protected dashboards by role */}
              <Route path="/" element={<MainLayout />}>
                <Route
                  path="passenger"
                  element={
                    <AuthGate role="passenger">
                      <PassengerDashboard />
                    </AuthGate>
                  }
                />
                <Route
                  path="operator"
                  element={
                    <AuthGate role="operator">
                      <OperatorDashboard />
                    </AuthGate>
                  }
                />
                {/* Optionally, add admin routes here */}
                <Route
                  path="qr"
                  element={
                    <AuthGate role={null}>
                      <QRScanner />
                    </AuthGate>
                  }
                />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route
                path="/admin"
                element={
                  <AuthGate role="admin">
                    <AdminDashboard />
                  </AuthGate>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
