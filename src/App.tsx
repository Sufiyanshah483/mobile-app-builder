import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TrustScore from "./pages/TrustScore";
import ClaimScanner from "./pages/ClaimScanner";
import MediaAuthenticator from "./pages/MediaAuthenticator";
import Auth from "./pages/Auth";
import Games from "./pages/Games";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";
import FakeNewsGame from "./pages/games/FakeNewsGame";
import BiasDetectorGame from "./pages/games/BiasDetectorGame";
import EmotionalLanguageGame from "./pages/games/EmotionalLanguageGame";
import NotFound from "./pages/NotFound";

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
          <Route path="/verify" element={<Verify />} />
          <Route path="/games" element={<Games />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games/fake-news" element={<FakeNewsGame />} />
          <Route path="/games/bias-detector" element={<BiasDetectorGame />} />
          <Route path="/games/emotional-language" element={<EmotionalLanguageGame />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;