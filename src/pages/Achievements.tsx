import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Lock, Check, Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

const Achievements = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userStats, setUserStats] = useState({
    verificationCount: 0,
    gamesPlayed: 0,
    highScore: 0,
    level: 1,
    resilienceScore: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Fetch all achievements
    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: true });

    if (achievementsData) {
      setAchievements(achievementsData);
    }

    if (session?.user) {
      // Fetch user's unlocked achievements
      const { data: userAchData } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", session.user.id);

      if (userAchData) {
        setUserAchievements(userAchData);
      }

      // Fetch user stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("level, resilience_score")
        .eq("user_id", session.user.id)
        .single();

      const { data: verifications } = await supabase
        .from("verification_history")
        .select("id")
        .eq("user_id", session.user.id);

      const { data: gameProgress } = await supabase
        .from("game_progress")
        .select("score")
        .eq("user_id", session.user.id);

      setUserStats({
        verificationCount: verifications?.length || 0,
        gamesPlayed: gameProgress?.length || 0,
        highScore: gameProgress ? Math.max(...gameProgress.map(g => g.score), 0) : 0,
        level: profile?.level || 1,
        resilienceScore: profile?.resilience_score || 0,
      });
    }

    setLoading(false);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getProgress = (achievement: Achievement) => {
    switch (achievement.requirement_type) {
      case "verification_count":
        return Math.min((userStats.verificationCount / achievement.requirement_value) * 100, 100);
      case "games_played":
        return Math.min((userStats.gamesPlayed / achievement.requirement_value) * 100, 100);
      case "high_score":
        return Math.min((userStats.highScore / achievement.requirement_value) * 100, 100);
      case "level_reached":
        return Math.min((userStats.level / achievement.requirement_value) * 100, 100);
      case "resilience_score":
        return Math.min((userStats.resilienceScore / achievement.requirement_value) * 100, 100);
      default:
        return 0;
    }
  };

  const getProgressText = (achievement: Achievement) => {
    switch (achievement.requirement_type) {
      case "verification_count":
        return `${userStats.verificationCount}/${achievement.requirement_value}`;
      case "games_played":
        return `${userStats.gamesPlayed}/${achievement.requirement_value}`;
      case "high_score":
        return `${userStats.highScore}/${achievement.requirement_value}`;
      case "level_reached":
        return `Level ${userStats.level}/${achievement.requirement_value}`;
      case "resilience_score":
        return `${userStats.resilienceScore}/${achievement.requirement_value}`;
      default:
        return "";
    }
  };

  const categories = [
    { id: "all", label: "All", icon: Star },
    { id: "verification", label: "Verify", icon: Check },
    { id: "games", label: "Games", icon: Zap },
    { id: "progress", label: "Progress", icon: Trophy },
  ];

  const filteredAchievements = selectedCategory === "all"
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = userAchievements.length;
  const totalPoints = achievements
    .filter(a => isUnlocked(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />

      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center justify-between py-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold text-foreground">Achievements</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Stats Overview */}
        <Card className="glass-card p-6 border-primary/20 animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Award className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Your Progress</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {unlockedCount}/{achievements.length}
              </p>
              <p className="text-xs text-primary font-medium">{totalPoints} points earned</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-bold text-gradient-primary">
                {Math.round((unlockedCount / Math.max(achievements.length, 1)) * 100)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar animate-slide-up" style={{ animationDelay: "50ms" }}>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 ${selectedCategory === cat.id ? "gradient-primary text-primary-foreground" : ""}`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading achievements...</div>
            </div>
          ) : (
            filteredAchievements.map((achievement, index) => {
              const unlocked = isUnlocked(achievement.id);
              const progress = getProgress(achievement);
              
              return (
                <Card
                  key={achievement.id}
                  className={`glass-card p-4 transition-all animate-slide-up ${
                    unlocked 
                      ? "border-primary/30 bg-primary/5" 
                      : "border-border/50 opacity-80"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      unlocked 
                        ? "bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg shadow-primary/20" 
                        : "bg-muted/50"
                    }`}>
                      {unlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-display font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                          {achievement.name}
                        </h3>
                        {unlocked && (
                          <Check className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {!unlocked && (
                        <div className="space-y-1">
                          <Progress value={progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">
                            {getProgressText(achievement)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${unlocked ? "text-primary" : "text-muted-foreground"}`}>
                        +{achievement.points}
                      </span>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Achievements;
