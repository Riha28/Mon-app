import "@/App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import VerifyEmail from "@/pages/VerifyEmail";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import AppLayout from "@/components/AppLayout";
import Discover from "@/pages/Discover";
import Matches from "@/pages/Matches";
import Messages from "@/pages/Messages";
import Chat from "@/pages/Chat";
import ProfilePage from "@/pages/ProfilePage";
import Plans from "@/pages/Plans";
import Support from "@/pages/Support";
import VipClub from "@/pages/VipClub";
import Favorites from "@/pages/Favorites";
import PaymentResult from "@/pages/PaymentResult";
import Admin from "@/pages/Admin";
import Legal from "@/pages/Legal";
import AcceptableUse from "@/pages/AcceptableUse";
import LawEnforcement from "@/pages/LawEnforcement";
function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading || user === null) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/app" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/acceptable-use" element={<AcceptableUse />} />
      <Route path="/law-enforcement" element={<LawEnforcement />} />
      <Route path="/payment/success" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
      <Route path="/payment/cancel" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Discover />} />
        <Route path="matches" element={<Matches />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="messages" element={<Messages />} />
        <Route path="chat/:matchId" element={<Chat />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="plans" element={<Plans />} />
        <Route path="support" element={<Support />} />
        <Route path="vip-club" element={<VipClub />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </div>
  );
}

export default App;
