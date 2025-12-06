import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Crown, Flame, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_score: number;
  games_played: number;
  rank: number;
}

interface GameLeaderboard {
  gameId: string;
  gameName: string;
  icon: string;
  entries: LeaderboardEntry[];
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [leaderboards, setLeaderboards] = useState<GameLeaderboard[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const games = [
    { id: "all", name: "All Games", icon: "🏆" },
    { id: "fake-news", name: "Fake News", icon: "📰" },
    { id: "bias-detector", name: "Bias Detector", icon: "⚖️" },
    { id: "emotional-language", name: "Emotional Language", icon: "💬" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [timeframe, selectedGame]);

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leaderboard_scores'
        },
        () => {
          fetchLeaderboards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeframe, selectedGame]);

  const getDateFilter = () => {
    const now = new Date();
    if (timeframe === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString();
    } else if (timeframe === "monthly") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString();
    }
    return null;
  };

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      
      let query = supabase
        .from("leaderboard_scores")
        .select("user_id, game_id, game_name, score, created_at");
      
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      if (selectedGame !== "all") {
        query = query.eq("game_id", selectedGame);
      }

      const { data: scores } = await query;

      if (!scores) {
        setGlobalLeaderboard([]);
        setLoading(false);
        return;
      }

      // Aggregate scores by user
      const userScores: Record<string, { total: number; games: Set<string>; userId: string }> = {};
      
      scores.forEach((score) => {
        if (!userScores[score.user_id]) {
          userScores[score.user_id] = { total: 0, games: new Set(), userId: score.user_id };
        }
        userScores[score.user_id].total += score.score;
        userScores[score.user_id].games.add(score.game_id);
      });

      // Fetch profiles for display names
      const userIds = Object.keys(userScores);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      // Create leaderboard entries
      const entries: LeaderboardEntry[] = Object.entries(userScores)
        .map(([userId, data]) => ({
          user_id: userId,
          display_name: profileMap.get(userId) || `Player ${userId.slice(0, 6)}`,
          total_score: data.total,
          games_played: data.games.size,
          rank: 0,
        }))
        .sort((a, b) => b.total_score - a.total_score)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      setGlobalLeaderboard(entries);

      // Find user's rank
      if (user) {
        const userEntry = entries.find(e => e.user_id === user.id);
        setUserRank(userEntry?.rank || null);
      }

    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/20 border-primary/50";
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-300/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30";
      default:
        return "bg-card/50 border-border/30";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center h-16 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/games")}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-xl">Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 relative z-10">
        {/* User Rank Banner */}
        {user && userRank && (
          <div className="glass rounded-xl p-4 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl gradient-primary glow-primary">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="font-display font-bold text-2xl text-foreground">
                  #{userRank}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {timeframe === "weekly" ? "This Week" : timeframe === "monthly" ? "This Month" : "All Time"}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">Keep climbing!</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Tabs */}
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="weekly" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="alltime" className="data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Game Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGame === game.id
                  ? "gradient-primary text-primary-foreground shadow-lg"
                  : "glass hover:bg-secondary"
              }`}
            >
              <span>{game.icon}</span>
              <span>{game.name}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-muted rounded mb-2" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : globalLeaderboard.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                No Scores Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to claim the top spot!
              </p>
              <Button 
                onClick={() => navigate("/games")}
                className="gradient-primary text-primary-foreground"
              >
                Play Games
              </Button>
            </div>
          ) : (
            globalLeaderboard.slice(0, 20).map((entry, index) => {
              const isCurrentUser = user?.id === entry.user_id;
              return (
                <div
                  key={entry.user_id}
                  className={`rounded-xl p-4 border transition-all animate-slide-up ${getRankBg(entry.rank, isCurrentUser)}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center glass">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                        {entry.display_name}
                        {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.games_played} game{entry.games_played !== 1 ? "s" : ""} played
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-foreground">
                        {entry.total_score.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sign in prompt for non-authenticated users */}
        {!user && (
          <div className="glass rounded-xl p-6 text-center animate-slide-up">
            <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold text-foreground mb-2">
              Join the Competition
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to save your scores and compete on the leaderboard!
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground"
            >
              Sign In to Compete
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
