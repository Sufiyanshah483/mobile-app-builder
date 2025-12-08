import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TrustScore from "./pages/TrustScore";
import ClaimScanner from "./pages/ClaimScanner";
import MediaAuthenticator from "./pages/MediaAuthenticator";
import Games from "./pages/Games";
import FakeNewsGame from "./pages/games/FakeNewsGame";
import BiasDetectorGame from "./pages/games/BiasDetectorGame";
import EmotionalLanguageGame from "./pages/games/EmotionalLanguageGame";
import SourceVerificationGame from "./pages/games/SourceVerificationGame";
import LateralReadingGame from "./pages/games/LateralReadingGame";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";
import History from "./pages/History";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpCenter from "./pages/HelpCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/trust-score" element={<TrustScore />} />
          <Route path="/claim-scanner" element={<ClaimScanner />} />
          <Route path="/media-authenticator" element={<MediaAuthenticator />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/fake-news" element={<FakeNewsGame />} />
          <Route path="/games/bias-detector" element={<BiasDetectorGame />} />
          <Route path="/games/emotional-language" element={<EmotionalLanguageGame />} />
          <Route path="/games/source-verification" element={<SourceVerificationGame />} />
          <Route path="/games/lateral-reading" element={<LateralReadingGame />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/history" element={<History />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;