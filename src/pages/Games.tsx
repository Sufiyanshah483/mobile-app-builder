import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Newspaper, Scale, Heart, Trophy, Star, Crown, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface GameCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
  progress?: number;
  delay?: number;
}

const GameCard = ({ icon: Icon, title, description, color, onClick, progress = 0, delay = 0 }: GameCardProps) => (
  <button
    onClick={onClick}
    className="w-full glass rounded-xl p-5 text-left card-hover group animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {progress > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </button>
);

const Games = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [gameProgress, setGameProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchGameProgress(session.user.id), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGameProgress(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchGameProgress = async (userId: string) => {
    const { data } = await supabase
      .from("game_progress")
      .select("game_id, score, completed")
      .eq("user_id", userId);
    
    if (data) {
      const progress: Record<string, number> = {};
      data.forEach(g => {
        progress[g.game_id] = g.completed ? 100 : Math.min(g.score, 99);
      });
      setGameProgress(progress);
    }
  };

  const games = [
    {
      id: "fake-news",
      icon: Newspaper,
      title: "Spot the Fake News",
      description: "Can you tell real headlines from fake ones? Test your detection skills!",
      color: "bg-gradient-to-br from-primary to-emerald-500",
    },
    {
      id: "bias-detector",
      icon: Scale,
      title: "Source Bias Detector",
      description: "Match news sources to their credibility and bias ratings.",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      id: "emotional-language",
      icon: Heart,
      title: "Emotional Language Spotter",
      description: "Identify manipulative emotional language in text passages.",
      color: "bg-gradient-to-br from-accent to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center h-16 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-xl">Inoculation Games</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 relative z-10">
        {/* Stats Banner */}
        <div className="glass rounded-xl p-4 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary glow-primary">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className="font-display font-bold text-2xl text-foreground">
                {Object.values(gameProgress).reduce((a, b) => a + b, 0)} pts
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 transition-all ${
                    Object.keys(gameProgress).length >= star 
                      ? "text-warning fill-warning animate-pulse-glow" 
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/leaderboard")}
              className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
            >
              <Crown className="w-3 h-3 mr-1" />
              View Leaderboard
            </Button>
          </div>
        </div>

        {/* Leaderboard Quick Access */}
        <button
          onClick={() => navigate("/leaderboard")}
          className="w-full glass rounded-xl p-4 flex items-center justify-between card-hover animate-slide-up group"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-warning to-orange-500 transition-transform group-hover:scale-110">
              <Crown className="w-5 h-5 text-warning-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-foreground group-hover:text-warning transition-colors">Leaderboard</h3>
              <p className="text-sm text-muted-foreground">See top players & rankings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-warning animate-pulse" />
          </div>
        </button>

        {/* Description */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-display font-semibold text-foreground mb-2">
            Build Your Defenses
          </h2>
          <p className="text-sm text-muted-foreground">
            Practice identifying misinformation through fun, interactive challenges. 
            Each game teaches you real-world skills to spot manipulation.
          </p>
        </div>

        {/* Game Cards */}
        <div className="space-y-3">
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              {...game}
              progress={gameProgress[game.id] || 0}
              onClick={() => navigate(`/games/${game.id}`)}
              delay={150 + index * 100}
            />
          ))}
        </div>

        {!user && (
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Sign in to save your progress and compete on leaderboards!
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground"
            >
              Sign In to Save Progress
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Games;