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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RefereeRegister />} />
          <Route path="/register/referee" element={<RefereeRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/counselors" element={<Counselors />} />
            <Route path="/counselors/add" element={<AddReferee />} />
            <Route path="/counselors/profile/:email" element={<RefereeProfile />} />
            <Route path="/counselors/referrals/:email" element={<RefereeReferrals />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/add" element={<AddUniversity />} />
            <Route path="/universities/:id/edit" element={<EditUniversity />} />
            <Route path="/universities/:id" element={<UniversityDetails />} />
            <Route path="/universities/:id/programs" element={<UniversityPrograms />} />
            <Route path="/universities/:universityId/programs/add" element={<AddProgram />} />
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
