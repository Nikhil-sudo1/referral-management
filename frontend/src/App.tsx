import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PublicPortal from "./pages/PublicPortal";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Referrals from "./pages/Referrals";
import Counselors from "./pages/Counselors";
import AddReferee from "./pages/AddReferee";
import RefereeProfile from "./pages/RefereeProfile";
import RefereeReferrals from "./pages/RefereeReferrals";
import Universities from "./pages/Universities";
import AddUniversity from "./pages/AddUniversity";
import EditUniversity from "./pages/EditUniversity";
import UniversityDetails from "./pages/UniversityDetails";
import UniversityPrograms from "./pages/UniversityPrograms";
import AddProgram from "./pages/AddProgram";
import EditProgram from "./pages/EditProgram";
import Leaderboard from "./pages/Leaderboard";
import Rewards from "./pages/Rewards";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ReferrerDashboard from "./pages/ReferrerDashboard";
import ReferrerReferrals from "./pages/ReferrerReferrals";
import ReferrerLeaderboard from "./pages/ReferrerLeaderboard";
import ReferrerAnalytics from "./pages/ReferrerAnalytics";
import ReferrerAddReferral from "./pages/ReferrerAddReferral";
import RefereeRegister from "./pages/RefereeRegister";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import VerifyEmail from "./pages/VerifyEmail";
import Leadership from "./pages/Leadership";
import NotFound from "./pages/NotFound";

// Initialize theme from localStorage on app load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Run immediately to prevent flash
initializeTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
      refetchOnMount: false, // Don't refetch on component mount if data exists
      retry: 1, // Only retry failed requests once
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* All Routes - No Auth for Competition Demo */}
          <Route path="/" element={<PublicPortal />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RefereeRegister />} />
          <Route path="/register/referee" element={<RefereeRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/referees" element={<Counselors />} />
            <Route path="/referees/add" element={<AddReferee />} />
            <Route path="/referees/profile/:email" element={<RefereeProfile />} />
            <Route path="/referees/referrals/:email" element={<RefereeReferrals />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/add" element={<AddUniversity />} />
            <Route path="/universities/:id/edit" element={<EditUniversity />} />
            <Route path="/universities/:id" element={<UniversityDetails />} />
            <Route path="/universities/:id/programs" element={<UniversityPrograms />} />
            <Route path="/universities/:universityId/programs/add" element={<AddProgram />} />
            <Route path="/universities/:universityId/programs/:programId/edit" element={<EditProgram />} />
            <Route path="/programs/add" element={<AddProgram />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/referrer" element={<ReferrerDashboard />} />
            <Route path="/referrer/referrals" element={<ReferrerReferrals />} />
            <Route path="/referrer/add" element={<ReferrerAddReferral />} />
            <Route path="/referrer/leaderboard" element={<ReferrerLeaderboard />} />
            <Route path="/referrer/analytics" element={<ReferrerAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
