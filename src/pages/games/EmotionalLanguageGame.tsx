import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Passage {
  id: number;
  text: string;
  manipulativeWords: string[];
  explanation: string;
}

const passages: Passage[] = [
  {
    id: 1,
    text: "The SHOCKING new policy will DEVASTATE hardworking families and DESTROY our cherished traditions!",
    manipulativeWords: ["SHOCKING", "DEVASTATE", "DESTROY", "cherished"],
    explanation: "Uses fear-inducing language (shocking, devastate, destroy) and emotional appeals (cherished traditions) to provoke reaction rather than inform."
  },
  {
    id: 2,
    text: "The new policy will affect approximately 500,000 households and change current regulations regarding tax deductions.",
    manipulativeWords: [],
    explanation: "This is neutral, factual reporting. It presents information without emotional manipulation."
  },
  {
    id: 3,
    text: "Critics SLAM the outrageous proposal as a MASSIVE BETRAYAL of voters' trust in this DANGEROUS move!",
    manipulativeWords: ["SLAM", "outrageous", "MASSIVE", "BETRAYAL", "DANGEROUS"],
    explanation: "Heavy use of loaded words (slam, outrageous, betrayal, dangerous) designed to provoke anger and distrust."
  },
  {
    id: 4,
    text: "Research indicates a 15% increase in reported incidents compared to the previous year's data.",
    manipulativeWords: [],
    explanation: "This is neutral, factual reporting with specific data and no emotional language."
  },
  {
    id: 5,
    text: "Brave patriots are fighting back against the CORRUPT elites who want to STEAL your freedom!",
    manipulativeWords: ["Brave", "patriots", "CORRUPT", "elites", "STEAL", "freedom"],
    explanation: "Uses us-vs-them framing with loaded terms (patriots, corrupt elites) and emotional appeals (steal your freedom)."
  },
  {
    id: 6,
    text: "The MIRACLE solution that doctors DON'T want you to know will TRANSFORM your life forever!",
    manipulativeWords: ["MIRACLE", "DON'T want you to know", "TRANSFORM", "forever"],
    explanation: "Classic manipulation: conspiracy framing (doctors hiding info), unrealistic promises (miracle, transform forever)."
  },
];

const EmotionalLanguageGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledPassages, setShuffledPassages] = useState<Passage[]>([]);

  useEffect(() => {
    setShuffledPassages([...passages].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

  const currentPassage = shuffledPassages[currentIndex];

  const toggleWord = (word: string) => {
    if (answered) return;
    setSelectedWords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  const checkAnswer = () => {
    const correctWords = currentPassage.manipulativeWords;
    const correctSelections = selectedWords.filter(w => 
      correctWords.some(cw => w.toLowerCase().includes(cw.toLowerCase()) || cw.toLowerCase().includes(w.toLowerCase()))
    );
    const accuracy = correctWords.length === 0 
      ? (selectedWords.length === 0 ? 100 : 0)
      : Math.round((correctSelections.length / Math.max(correctWords.length, selectedWords.length)) * 100);
    
    setScore(score + Math.round(accuracy * 0.2));
    setAnswered(true);
  };

  const nextQuestion = async () => {
    if (currentIndex < shuffledPassages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedWords([]);
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
      .eq("game_id", "emotional-language")
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
          game_id: "emotional-language",
          game_name: "Emotional Language Spotter",
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
    setShuffledPassages([...passages].sort(() => Math.random() - 0.5).slice(0, 5));
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedWords([]);
    setGameComplete(false);
  };

  const renderPassageWithHighlights = () => {
    const words = currentPassage.text.split(/(\s+)/);
    return words.map((word, i) => {
      const cleanWord = word.replace(/[^a-zA-Z']/g, '');
      if (!cleanWord) return <span key={i}>{word}</span>;
      
      const isSelected = selectedWords.includes(cleanWord);
      const isManipulative = currentPassage.manipulativeWords.some(
        mw => cleanWord.toLowerCase().includes(mw.toLowerCase()) || mw.toLowerCase().includes(cleanWord.toLowerCase())
      );
      
      let className = "px-0.5 rounded cursor-pointer transition-colors ";
      if (answered) {
        if (isManipulative) {
          className += isSelected ? "bg-success/30 text-success" : "bg-warning/30 text-warning";
        } else if (isSelected) {
          className += "bg-destructive/30 text-destructive";
        }
      } else if (isSelected) {
        className += "bg-accent/30 text-accent";
      } else {
        className += "hover:bg-muted";
      }

      return (
        <span 
          key={i} 
          className={className}
          onClick={() => !answered && toggleWord(cleanWord)}
        >
          {word}
        </span>
      );
    });
  };

  if (shuffledPassages.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/games")} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Emotional Language</h1>
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
              {shuffledPassages.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-primary" : 
                    i === currentIndex ? "bg-primary/50" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Tap on manipulative/emotional words in this passage:
              </p>
              <p className="text-xs">
                Look for fear-inducing, loaded, or emotionally charged language
              </p>
            </div>

            {/* Passage Card */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                Passage {currentIndex + 1} of {shuffledPassages.length}
              </p>
              <p className="text-lg leading-relaxed">
                {renderPassageWithHighlights()}
              </p>
            </div>

            {/* Selected Words */}
            {selectedWords.length > 0 && !answered && (
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent cursor-pointer"
                    onClick={() => toggleWord(word)}
                  >
                    {word} ×
                  </span>
                ))}
              </div>
            )}

            {!answered ? (
              <Button 
                onClick={checkAnswer} 
                className="w-full gradient-primary text-primary-foreground h-12"
              >
                {selectedWords.length === 0 ? "No Manipulation Found" : `Check ${selectedWords.length} Word${selectedWords.length > 1 ? 's' : ''}`}
              </Button>
            ) : (
              <div className="space-y-4 animate-slide-up">
                <div className="rounded-xl p-4 bg-muted/50 border border-border">
                  <p className="font-semibold text-foreground mb-2">Explanation:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPassage.explanation}
                  </p>
                  {currentPassage.manipulativeWords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Manipulative words:</p>
                      <div className="flex flex-wrap gap-1">
                        {currentPassage.manipulativeWords.map((word, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs rounded bg-warning/20 text-warning">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={nextQuestion} className="w-full gradient-primary text-primary-foreground h-12">
                  {currentIndex < shuffledPassages.length - 1 ? "Next Passage" : "See Results"}
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
                {score >= 80 ? "Language Expert!" : score >= 60 ? "Good Eye!" : "Keep Practicing!"}
              </h2>
              <p className="text-4xl font-display font-bold text-primary mb-2">
                {score}/100
              </p>
              <p className="text-muted-foreground">
                Recognizing emotional manipulation helps you think more critically.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={restartGame} variant="outline" className="flex-1 h-12">
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={() => navigate("/games")} className="flex-1 h-12 gradient-primary text-primary-foreground">
                More Games
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmotionalLanguageGame;