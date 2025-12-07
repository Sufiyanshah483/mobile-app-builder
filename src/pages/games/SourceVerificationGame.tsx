import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Zap, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { submitScore } from "@/hooks/useLeaderboard";

interface Scenario {
  id: number;
  claim: string;
  sources: {
    name: string;
    isReliable: boolean;
    reason: string;
  }[];
  correctAnswer: string;
  explanation: string;
}

const scenarios: Scenario[] = [
  {
    id: 1,
    claim: "A new study shows coffee prevents all types of cancer",
    sources: [
      { name: "HealthNews24.net (unknown blog)", isReliable: false, reason: "Unknown source, sensational claims" },
      { name: "Mayo Clinic", isReliable: true, reason: "Reputable medical institution" },
      { name: "Dr. Johnson's Health Tips (Facebook page)", isReliable: false, reason: "Social media, unverified credentials" },
    ],
    correctAnswer: "Mayo Clinic",
    explanation: "Always verify health claims with established medical institutions. Mayo Clinic is a reputable source, while blogs and social media pages often spread misinformation."
  },
  {
    id: 2,
    claim: "Breaking: Major earthquake hits California - 8.5 magnitude",
    sources: [
      { name: "USGS (US Geological Survey)", isReliable: true, reason: "Official government seismic monitoring" },
      { name: "BreakingNewsNow.co", isReliable: false, reason: "Unknown news site, often publishes clickbait" },
      { name: "Random Twitter account with 50 followers", isReliable: false, reason: "Unverified social media account" },
    ],
    correctAnswer: "USGS (US Geological Survey)",
    explanation: "For natural disaster information, always check official government sources like USGS, NOAA, or local emergency services."
  },
  {
    id: 3,
    claim: "New government policy announced on education funding",
    sources: [
      { name: "Official Government Press Release", isReliable: true, reason: "Primary source, direct from government" },
      { name: "PoliticalOpinions.blog", isReliable: false, reason: "Opinion blog, may have bias" },
      { name: "Associated Press", isReliable: true, reason: "Reputable wire service with fact-checking" },
    ],
    correctAnswer: "Official Government Press Release",
    explanation: "For policy announcements, primary sources (official government releases) are best, followed by reputable news agencies."
  },
  {
    id: 4,
    claim: "Scientists discover cure for common cold",
    sources: [
      { name: "Nature Journal", isReliable: true, reason: "Peer-reviewed scientific journal" },
      { name: "MiracleHealthCures.com", isReliable: false, reason: "Commercial site selling health products" },
      { name: "Chain email from relative", isReliable: false, reason: "Unverified, commonly spreads misinformation" },
    ],
    correctAnswer: "Nature Journal",
    explanation: "Scientific discoveries should be verified through peer-reviewed journals like Nature, Science, or The Lancet."
  },
  {
    id: 5,
    claim: "Famous celebrity endorses political candidate",
    sources: [
      { name: "Celebrity's verified official account", isReliable: true, reason: "Primary source, verified identity" },
      { name: "CelebrityGossip.net", isReliable: false, reason: "Tabloid site, often fabricates stories" },
      { name: "Parody account with similar name", isReliable: false, reason: "Impersonation account" },
    ],
    correctAnswer: "Celebrity's verified official account",
    explanation: "For statements attributed to individuals, their verified official accounts or statements are the most reliable source."
  },
];

const SourceVerificationGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledScenarios, setShuffledScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

  const currentScenario = shuffledScenarios[currentIndex];

  const handleAnswer = (sourceName: string) => {
    setSelectedSource(sourceName);
    const isCorrect = sourceName === currentScenario.correctAnswer;
    if (isCorrect) setScore(score + 20);
    setAnswered(true);
  };

  const nextQuestion = async () => {
    if (currentIndex < shuffledScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedSource(null);
    } else {
      setGameComplete(true);
      await saveProgress();
    }
  };

  const saveProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await submitScore(session.user.id, "source-verification", "Source Verification", score);

    const { data: existing } = await supabase
      .from("game_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("game_id", "source-verification")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("game_progress")
        .update({ 
          score: Math.max(existing.score, score),
          attempts: existing.attempts + 1,
          completed: score >= 80,
          last_played_at: new Date().toISOString()
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("game_progress")
        .insert({
          user_id: session.user.id,
          game_id: "source-verification",
          game_name: "Source Verification",
          score,
          completed: score >= 80,
          attempts: 1,
          last_played_at: new Date().toISOString()
        });
    }

    toast({
      title: score >= 80 ? "🏆 Source Expert!" : "💪 Good effort!",
      description: `You scored ${score} points!`,
    });
  };

  const restartGame = () => {
    setShuffledScenarios([...scenarios].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedSource(null);
    setGameComplete(false);
  };

  if (shuffledScenarios.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Source Verification</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="font-display font-bold text-primary">{score}</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 relative z-10">
        {!gameComplete ? (
          <div className="space-y-6 animate-slide-up">
            {/* Progress */}
            <div className="flex gap-1">
              {shuffledScenarios.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-primary" : 
                    i === currentIndex ? "bg-primary/50" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Claim Card */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Scenario {currentIndex + 1} of {shuffledScenarios.length}
              </p>
              <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
                <p className="text-lg font-medium text-foreground">
                  "{currentScenario.claim}"
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Which source would you trust most to verify this claim?
              </p>
            </div>

            {/* Source Options */}
            <div className="space-y-3">
              {currentScenario.sources.map((source, i) => {
                const isSelected = selectedSource === source.name;
                const isCorrect = source.name === currentScenario.correctAnswer;
                
                let borderClass = "border-border/50 hover:border-primary/50";
                if (answered) {
                  if (isCorrect) {
                    borderClass = "border-success bg-success/10";
                  } else if (isSelected && !isCorrect) {
                    borderClass = "border-destructive bg-destructive/10";
                  }
                } else if (isSelected) {
                  borderClass = "border-primary bg-primary/10";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !answered && handleAnswer(source.name)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${borderClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        answered 
                          ? isCorrect 
                            ? "bg-success/20 text-success" 
                            : "bg-destructive/20 text-destructive"
                          : "bg-muted"
                      }`}>
                        {answered ? (
                          isCorrect ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{source.name}</p>
                        {answered && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {source.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="space-y-4 animate-slide-up">
                <div className="rounded-xl p-4 bg-muted/50 border border-border">
                  <p className="font-semibold text-foreground mb-2">💡 Key Lesson:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentScenario.explanation}
                  </p>
                </div>
                <Button onClick={nextQuestion} className="w-full gradient-primary text-primary-foreground h-12">
                  {currentIndex < shuffledScenarios.length - 1 ? "Next Scenario" : "See Results"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="glass rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cyan-500/10" />
              <div className="relative z-10">
                <div className="text-7xl mb-4 animate-bounce">
                  {score >= 80 ? "🏆" : score >= 60 ? "⭐" : "💪"}
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  {score >= 80 ? "Source Expert!" : score >= 60 ? "Good Progress!" : "Keep Learning!"}
                </h2>
                <p className="text-5xl font-display font-bold text-gradient-primary mb-2">
                  {score}/100
                </p>
                <p className="text-muted-foreground">
                  Knowing which sources to trust is crucial for avoiding misinformation.
                </p>
                {score >= 80 && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-success">
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">Score submitted to leaderboard!</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={restartGame} variant="outline" className="h-14 flex-col">
                <RefreshCw className="w-4 h-4 mb-1" />
                <span className="text-xs">Retry</span>
              </Button>
              <Button 
                onClick={() => navigate("/leaderboard")} 
                variant="outline"
                className="h-14 flex-col border-warning/30 hover:bg-warning/10"
              >
                <Trophy className="w-4 h-4 mb-1 text-warning" />
                <span className="text-xs">Ranks</span>
              </Button>
              <Button 
                onClick={() => navigate("/games")} 
                className="h-14 flex-col gradient-primary text-primary-foreground"
              >
                <Zap className="w-4 h-4 mb-1" />
                <span className="text-xs">More</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SourceVerificationGame;
