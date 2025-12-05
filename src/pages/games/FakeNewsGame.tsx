import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Headline {
  id: number;
  text: string;
  isFake: boolean;
  explanation: string;
}

const headlines: Headline[] = [
  {
    id: 1,
    text: "Scientists Discover New Species of Deep-Sea Fish With Transparent Head",
    isFake: false,
    explanation: "This is real! The Barreleye fish (Macropinna microstoma) has a transparent head."
  },
  {
    id: 2,
    text: "NASA Confirms Moon Made Entirely of Cheese After New Sample Analysis",
    isFake: true,
    explanation: "Obviously fake! The moon is made of rock and minerals, not cheese."
  },
  {
    id: 3,
    text: "World's Oldest Message in a Bottle Found After 132 Years at Sea",
    isFake: false,
    explanation: "This is real! A bottle from 1886 was found on an Australian beach in 2018."
  },
  {
    id: 4,
    text: "Study Shows Plants Can Scream When Stressed, Humans Just Can't Hear It",
    isFake: false,
    explanation: "This is real! Research from Tel Aviv University found plants emit ultrasonic sounds when stressed."
  },
  {
    id: 5,
    text: "Government Announces Free WiFi Powered by 5G Towers Reading Minds",
    isFake: true,
    explanation: "This is fake! 5G towers cannot read minds. This is a common conspiracy theory."
  },
  {
    id: 6,
    text: "Octopuses Have Three Hearts and Blue Blood",
    isFake: false,
    explanation: "This is real! Octopuses have three hearts and copper-based blue blood."
  },
  {
    id: 7,
    text: "Breaking: Scientist Proves Earth is Actually Shaped Like a Donut",
    isFake: true,
    explanation: "This is fake! The Earth is an oblate spheroid, not a donut shape."
  },
  {
    id: 8,
    text: "Honey Never Spoils - 3000-Year-Old Honey Found Edible in Egyptian Tombs",
    isFake: false,
    explanation: "This is real! Honey's low moisture and high acidity prevent bacterial growth."
  },
];

const FakeNewsGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledHeadlines, setShuffledHeadlines] = useState<Headline[]>([]);

  useEffect(() => {
    setShuffledHeadlines([...headlines].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

  const currentHeadline = shuffledHeadlines[currentIndex];

  const handleAnswer = (isFake: boolean) => {
    if (answered) return;
    
    setSelectedAnswer(isFake);
    setAnswered(true);
    
    const isCorrect = isFake === currentHeadline.isFake;
    if (isCorrect) {
      setScore(score + 20);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < shuffledHeadlines.length - 1) {
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

    const { data: existing } = await supabase
      .from("game_progress")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("game_id", "fake-news")
      .single();

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
          game_id: "fake-news",
          game_name: "Spot the Fake News",
          score,
          completed: score >= 80,
          attempts: 1,
          last_played_at: new Date().toISOString()
        });
    }

    toast({
      title: score >= 80 ? "Excellent!" : "Good try!",
      description: `You scored ${score} points!`,
    });
  };

  const restartGame = () => {
    setShuffledHeadlines([...headlines].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setGameComplete(false);
  };

  if (shuffledHeadlines.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Spot the Fake News</h1>
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
              {shuffledHeadlines.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-primary" : 
                    i === currentIndex ? "bg-primary/50" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Question Card */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                Question {currentIndex + 1} of {shuffledHeadlines.length}
              </p>
              <h2 className="text-xl font-display font-semibold text-foreground leading-relaxed">
                "{currentHeadline.text}"
              </h2>
            </div>

            {/* Answer Buttons */}
            {!answered ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  className="h-16 text-lg font-semibold border-success/30 hover:bg-success/10 hover:border-success"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2 text-success" />
                  Real
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  variant="outline"
                  className="h-16 text-lg font-semibold border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                >
                  <XCircle className="w-5 h-5 mr-2 text-destructive" />
                  Fake
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 ${
                  selectedAnswer === currentHeadline.isFake 
                    ? "bg-success/20 border border-success/30" 
                    : "bg-destructive/20 border border-destructive/30"
                }`}>
                  <p className={`font-semibold mb-2 ${
                    selectedAnswer === currentHeadline.isFake ? "text-success" : "text-destructive"
                  }`}>
                    {selectedAnswer === currentHeadline.isFake ? "Correct! ✓" : "Incorrect ✗"}
                  </p>
                  <p className="text-sm text-foreground/80">
                    {currentHeadline.explanation}
                  </p>
                </div>
                <Button onClick={nextQuestion} className="w-full gradient-primary text-primary-foreground h-12">
                  {currentIndex < shuffledHeadlines.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="glass rounded-2xl p-8">
              <div className="text-6xl mb-4">
                {score >= 80 ? "🏆" : score >= 60 ? "⭐" : "💪"}
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : "Keep Practicing!"}
              </h2>
              <p className="text-4xl font-display font-bold text-primary mb-2">
                {score}/100
              </p>
              <p className="text-muted-foreground">
                You correctly identified {score / 20} out of 5 headlines.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={restartGame} 
                variant="outline" 
                className="flex-1 h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button 
                onClick={() => navigate("/games")} 
                className="flex-1 h-12 gradient-primary text-primary-foreground"
              >
                More Games
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FakeNewsGame;