import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, ChevronRight, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { submitScore } from "@/hooks/useLeaderboard";

interface Source {
  id: number;
  name: string;
  bias: "left" | "center" | "right";
  reliability: "high" | "mixed" | "low";
  description: string;
}

const sources: Source[] = [
  { id: 1, name: "Reuters", bias: "center", reliability: "high", description: "International news agency known for factual reporting" },
  { id: 2, name: "Fox News", bias: "right", reliability: "mixed", description: "Conservative-leaning cable news network" },
  { id: 3, name: "MSNBC", bias: "left", reliability: "mixed", description: "Liberal-leaning cable news network" },
  { id: 4, name: "Associated Press", bias: "center", reliability: "high", description: "Non-profit news cooperative" },
  { id: 5, name: "Breitbart", bias: "right", reliability: "low", description: "Far-right news and opinion website" },
  { id: 6, name: "The Huffington Post", bias: "left", reliability: "mixed", description: "Liberal news and opinion site" },
  { id: 7, name: "BBC News", bias: "center", reliability: "high", description: "British public broadcasting news" },
  { id: 8, name: "Daily Wire", bias: "right", reliability: "mixed", description: "Conservative news and opinion website" },
];

const BiasDetectorGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedBias, setSelectedBias] = useState<string | null>(null);
  const [selectedReliability, setSelectedReliability] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledSources, setShuffledSources] = useState<Source[]>([]);
  const [phase, setPhase] = useState<"bias" | "reliability">("bias");

  useEffect(() => {
    setShuffledSources([...sources].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

  const currentSource = shuffledSources[currentIndex];

  const handleBiasAnswer = (bias: string) => {
    setSelectedBias(bias);
    const isCorrect = bias === currentSource.bias;
    if (isCorrect) setScore(score + 10);
    setPhase("reliability");
  };

  const handleReliabilityAnswer = (reliability: string) => {
    setSelectedReliability(reliability);
    const isCorrect = reliability === currentSource.reliability;
    if (isCorrect) setScore(score + 10);
    setAnswered(true);
  };

  const nextQuestion = async () => {
    if (currentIndex < shuffledSources.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedBias(null);
      setSelectedReliability(null);
      setPhase("bias");
    } else {
      setGameComplete(true);
      await saveProgress();
    }
  };

  const saveProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Submit to leaderboard
    await submitScore(session.user.id, "bias-detector", "Source Bias Detector", score);

    const { data: existing } = await supabase
      .from("game_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("game_id", "bias-detector")
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
          game_id: "bias-detector",
          game_name: "Source Bias Detector",
          score,
          completed: score >= 80,
          attempts: 1,
          last_played_at: new Date().toISOString()
        });
    }

    toast({
      title: score >= 80 ? "🏆 Media Expert!" : "💪 Good try!",
      description: `You scored ${score} points! Check the leaderboard!`,
    });
  };

  const restartGame = () => {
    setShuffledSources([...sources].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedBias(null);
    setSelectedReliability(null);
    setPhase("bias");
    setGameComplete(false);
  };

  const biasColors = {
    left: "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20",
    center: "border-primary/50 bg-primary/10 hover:bg-primary/20",
    right: "border-red-500/50 bg-red-500/10 hover:bg-red-500/20",
  };

  const reliabilityColors = {
    high: "border-success/50 bg-success/10 hover:bg-success/20",
    mixed: "border-warning/50 bg-warning/10 hover:bg-warning/20",
    low: "border-destructive/50 bg-destructive/10 hover:bg-destructive/20",
  };

  if (shuffledSources.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Bias Detector</h1>
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
              {shuffledSources.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-primary" : 
                    i === currentIndex ? "bg-primary/50" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Source Card */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                Source {currentIndex + 1} of {shuffledSources.length}
              </p>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {currentSource.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {currentSource.description}
              </p>
            </div>

            {/* Questions */}
            {phase === "bias" && !selectedBias ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">What is this source's political bias?</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["left", "center", "right"] as const).map((bias) => (
                    <Button
                      key={bias}
                      onClick={() => handleBiasAnswer(bias)}
                      variant="outline"
                      className={`h-14 capitalize ${biasColors[bias]}`}
                    >
                      {bias === "left" ? "⬅️ Left" : bias === "right" ? "Right ➡️" : "Center"}
                    </Button>
                  ))}
                </div>
              </div>
            ) : phase === "reliability" && !answered ? (
              <div className="space-y-3 animate-slide-up">
                <div className={`rounded-lg p-3 ${
                  selectedBias === currentSource.bias 
                    ? "bg-success/20 text-success" 
                    : "bg-destructive/20 text-destructive"
                }`}>
                  <p className="text-sm font-medium">
                    {selectedBias === currentSource.bias ? "✓ Correct bias!" : `✗ It's actually ${currentSource.bias}-leaning`}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">How reliable is this source?</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["high", "mixed", "low"] as const).map((rel) => (
                    <Button
                      key={rel}
                      onClick={() => handleReliabilityAnswer(rel)}
                      variant="outline"
                      className={`h-14 capitalize ${reliabilityColors[rel]}`}
                    >
                      {rel}
                    </Button>
                  ))}
                </div>
              </div>
            ) : answered ? (
              <div className="space-y-4 animate-slide-up">
                <div className={`rounded-lg p-3 ${
                  selectedReliability === currentSource.reliability 
                    ? "bg-success/20 text-success" 
                    : "bg-destructive/20 text-destructive"
                }`}>
                  <p className="text-sm font-medium">
                    {selectedReliability === currentSource.reliability 
                      ? "✓ Correct reliability!" 
                      : `✗ It's actually ${currentSource.reliability} reliability`}
                  </p>
                </div>
                <Button onClick={nextQuestion} className="w-full gradient-primary text-primary-foreground h-12">
                  {currentIndex < shuffledSources.length - 1 ? "Next Source" : "See Results"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="glass rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10" />
              <div className="relative z-10">
                <div className="text-7xl mb-4 animate-bounce">
                  {score >= 80 ? "🏆" : score >= 60 ? "⭐" : "💪"}
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  {score >= 80 ? "Media Expert!" : score >= 60 ? "Good Progress!" : "Keep Learning!"}
                </h2>
                <p className="text-5xl font-display font-bold text-gradient-primary mb-2">
                  {score}/100
                </p>
                <p className="text-muted-foreground">
                  Understanding source bias helps you consume news more critically.
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

export default BiasDetectorGame;