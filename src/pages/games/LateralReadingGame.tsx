import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trophy, Zap, Search, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { submitScore } from "@/hooks/useLeaderboard";

interface Question {
  id: number;
  website: string;
  websiteDescription: string;
  claim: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  lateralTip: string;
}

const questions: Question[] = [
  {
    id: 1,
    website: "NaturalHealthDaily.org",
    websiteDescription: "Professional-looking health website with medical imagery",
    claim: "This website claims that essential oils can cure diabetes.",
    options: [
      { 
        text: "Trust it - the website looks professional", 
        isCorrect: false, 
        feedback: "A professional appearance doesn't indicate credibility. Many misleading sites invest in design." 
      },
      { 
        text: "Search for the site name + 'review' or 'scam' to see what others say", 
        isCorrect: true, 
        feedback: "Lateral reading! Checking what others say about a source helps reveal its credibility." 
      },
      { 
        text: "The .org domain means it's trustworthy", 
        isCorrect: false, 
        feedback: "Anyone can register a .org domain. It doesn't indicate authority or accuracy." 
      },
    ],
    lateralTip: "Leave the website and search for what independent sources say about it. Professional appearance doesn't equal credibility."
  },
  {
    id: 2,
    website: "ClimateFactsNow.com",
    websiteDescription: "Climate research site with graphs and statistics",
    claim: "The site presents climate data contradicting mainstream science.",
    options: [
      { 
        text: "Check who funds or operates the website", 
        isCorrect: true, 
        feedback: "Great choice! Funding sources often reveal potential biases and motivations." 
      },
      { 
        text: "The data looks scientific so it must be accurate", 
        isCorrect: false, 
        feedback: "Scientific-looking data can be cherry-picked or misrepresented." 
      },
      { 
        text: "Spend time reading all their articles to evaluate", 
        isCorrect: false, 
        feedback: "Vertical reading (staying on the site) is less effective than lateral reading." 
      },
    ],
    lateralTip: "Check who funds or operates a website. Industry-funded sites may have conflicts of interest."
  },
  {
    id: 3,
    website: "Dr. Smith's Wellness Blog",
    websiteDescription: "Personal blog claiming author is a 'renowned physician'",
    claim: "Dr. Smith recommends a supplement he sells that 'cures' chronic fatigue.",
    options: [
      { 
        text: "Trust him - he claims to be a doctor", 
        isCorrect: false, 
        feedback: "Anyone can claim credentials online. Credentials should be verified." 
      },
      { 
        text: "Verify Dr. Smith's credentials through medical board databases", 
        isCorrect: true, 
        feedback: "Always verify claimed expertise through official sources like medical boards." 
      },
      { 
        text: "He has many testimonials so he must be legitimate", 
        isCorrect: false, 
        feedback: "Testimonials can be fabricated and aren't scientific evidence." 
      },
    ],
    lateralTip: "Verify claimed expertise through official databases. Look for conflicts of interest (selling products)."
  },
  {
    id: 4,
    website: "TruthPatriotNews.com",
    websiteDescription: "News site with breaking political stories",
    claim: "The site reports a major scandal with no other media coverage.",
    options: [
      { 
        text: "If no one else is reporting it, they must be the only ones brave enough", 
        isCorrect: false, 
        feedback: "Lack of coverage from other sources is a red flag, not a sign of exclusive truth." 
      },
      { 
        text: "Search for the story on mainstream news and fact-checking sites", 
        isCorrect: true, 
        feedback: "If a major story isn't covered elsewhere, it may be fabricated." 
      },
      { 
        text: "Share it immediately before it gets 'censored'", 
        isCorrect: false, 
        feedback: "Sharing unverified information spreads potential misinformation." 
      },
    ],
    lateralTip: "Major news should be reported by multiple outlets. Exclusive 'scoops' from unknown sites are often fabrications."
  },
  {
    id: 5,
    website: "GlobalResearchInstitute.org",
    websiteDescription: "Academic-looking site with 'research' papers",
    claim: "The institute publishes papers challenging established science.",
    options: [
      { 
        text: "Open new tabs to research who runs this 'institute'", 
        isCorrect: true, 
        feedback: "Many fake 'institutes' exist to give pseudoscience an air of legitimacy." 
      },
      { 
        text: "The academic language means it's peer-reviewed", 
        isCorrect: false, 
        feedback: "Academic language doesn't indicate peer review. Check if it's in real journals." 
      },
      { 
        text: "Institutes are always credible research organizations", 
        isCorrect: false, 
        feedback: "Anyone can call themselves an 'institute'. The name doesn't confer credibility." 
      },
    ],
    lateralTip: "Research who runs 'institutes' and 'foundations'. Many are advocacy groups, not research organizations."
  },
];

const LateralReadingGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (currentQuestion.options[index].isCorrect) {
      setScore(score + 20);
    }
    setAnswered(true);
  };

  const nextQuestion = async () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setGameComplete(true);
      await saveProgress();
    }
  };

  const saveProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await submitScore(session.user.id, "lateral-reading", "Lateral Reading Master", score);

    const { data: existing } = await supabase
      .from("game_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("game_id", "lateral-reading")
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
          game_id: "lateral-reading",
          game_name: "Lateral Reading Master",
          score,
          completed: score >= 80,
          attempts: 1,
          last_played_at: new Date().toISOString()
        });
    }

    toast({
      title: score >= 80 ? "🏆 Lateral Reading Pro!" : "💪 Good practice!",
      description: `You scored ${score} points!`,
    });
  };

  const restartGame = () => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setGameComplete(false);
  };

  if (shuffledQuestions.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Lateral Reading</h1>
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
              {shuffledQuestions.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-primary" : 
                    i === currentIndex ? "bg-primary/50" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Website Simulation */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="bg-muted/50 p-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 mx-2 px-3 py-1 rounded bg-background text-xs text-muted-foreground flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  {currentQuestion.website}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Question {currentIndex + 1} of {shuffledQuestions.length}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentQuestion.websiteDescription}
                </p>
                <p className="text-foreground font-medium">
                  {currentQuestion.claim}
                </p>
                <p className="text-sm text-primary mt-3">
                  What's the best way to verify this?
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => {
                let borderClass = "border-border/50 hover:border-primary/50";
                let bgClass = "";
                
                if (answered && selectedAnswer === i) {
                  if (option.isCorrect) {
                    borderClass = "border-success";
                    bgClass = "bg-success/10";
                  } else {
                    borderClass = "border-destructive";
                    bgClass = "bg-destructive/10";
                  }
                } else if (answered && option.isCorrect) {
                  borderClass = "border-success";
                  bgClass = "bg-success/10";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !answered && handleAnswer(i)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${borderClass} ${bgClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        answered 
                          ? option.isCorrect 
                            ? "bg-success text-white" 
                            : selectedAnswer === i 
                              ? "bg-destructive text-white"
                              : "bg-muted"
                          : "bg-muted"
                      }`}>
                        {answered ? (
                          option.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{String.fromCharCode(65 + i)}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{option.text}</p>
                        {answered && (
                          <p className="text-xs text-muted-foreground mt-1">{option.feedback}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="space-y-4 animate-slide-up">
                <div className="rounded-xl p-4 bg-primary/10 border border-primary/30">
                  <p className="text-sm font-semibold text-primary mb-1">🔍 Lateral Reading Tip:</p>
                  <p className="text-sm text-foreground">
                    {currentQuestion.lateralTip}
                  </p>
                </div>
                <Button onClick={nextQuestion} className="w-full gradient-primary text-primary-foreground h-12">
                  {currentIndex < shuffledQuestions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="glass rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <div className="relative z-10">
                <div className="text-7xl mb-4 animate-bounce">
                  {score >= 80 ? "🏆" : score >= 60 ? "⭐" : "💪"}
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  {score >= 80 ? "Lateral Reader!" : score >= 60 ? "Good Progress!" : "Keep Practicing!"}
                </h2>
                <p className="text-5xl font-display font-bold text-gradient-primary mb-2">
                  {score}/100
                </p>
                <p className="text-muted-foreground">
                  Lateral reading means leaving a site to verify its credibility elsewhere.
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

export default LateralReadingGame;
