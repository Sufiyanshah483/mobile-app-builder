import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Trophy, Target, Gamepad2, LogOut, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface ProfileData {
  display_name: string | null;
  resilience_score: number;
  level: number;
  avatar_url: string | null;
}

interface GameProgress {
  game_name: string;
  score: number;
  completed: boolean;
  attempts: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchProfile(session.user.id);
      await fetchGameProgress(session.user.id);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, resilience_score, level, avatar_url")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile(data);
      setNewDisplayName(data.display_name || "");
    }
  };

  const fetchGameProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from("game_progress")
      .select("game_name, score, completed, attempts")
      .eq("user_id", userId);

    if (data) {
      setGameProgress(data);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newDisplayName })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update display name");
    } else {
      toast.success("Display name updated!");
      setProfile(prev => prev ? { ...prev, display_name: newDisplayName } : null);
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getGameIcon = (gameName: string) => {
    switch (gameName) {
      case "fake-news":
        return "🕵️";
      case "bias-detector":
        return "⚖️";
      case "emotional-language":
        return "💬";
      default:
        return "🎮";
    }
  };

  const getGameTitle = (gameName: string) => {
    switch (gameName) {
      case "fake-news":
        return "Fake News Detective";
      case "bias-detector":
        return "Bias Detector";
      case "emotional-language":
        return "Emotional Language";
      default:
        return gameName;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  const totalScore = gameProgress.reduce((acc, g) => acc + g.score, 0);
  const gamesCompleted = gameProgress.filter(g => g.completed).length;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center justify-between py-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold text-foreground">Profile</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Profile Card */}
        <Card className="glass-card p-6 border-primary/20 animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="bg-background/50"
                  />
                  <Button size="icon" variant="ghost" onClick={handleUpdateDisplayName}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {profile?.display_name || "Anonymous User"}
                  </h2>
                  <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  Level {profile?.level || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-background/50 border border-border/50">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{profile?.resilience_score || 0}</p>
              <p className="text-xs text-muted-foreground">Resilience</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background/50 border border-border/50">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold text-foreground">{totalScore}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-background/50 border border-border/50">
              <Gamepad2 className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold text-foreground">{gamesCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        {/* Game Progress */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Game Progress
          </h3>

          {gameProgress.length > 0 ? (
            <div className="space-y-3">
              {gameProgress.map((game, index) => (
                <Card
                  key={game.game_name}
                  className="glass-card p-4 border-border/50 hover:border-primary/30 transition-all"
                  style={{ animationDelay: `${(index + 2) * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getGameIcon(game.game_name)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{getGameTitle(game.game_name)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {game.attempts} attempts • {game.completed ? "Completed" : "In Progress"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{game.score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-6 border-border/50 text-center">
              <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No games played yet</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => navigate("/games")}
              >
                Start Playing
              </Button>
            </Card>
          )}
        </section>

        {/* Actions */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </section>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
