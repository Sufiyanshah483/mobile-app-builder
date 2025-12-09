import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, CheckCircle2, Clock, Flame, Trophy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  points: number;
  difficulty: string;
  completed?: boolean;
}

const DailyChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchChallenges(session.user.id);
      } else {
        await fetchChallenges(null);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const fetchChallenges = async (userId: string | null) => {
    const { data: challengesData, error } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching challenges:", error);
      return;
    }

    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      const { data: userProgress } = await supabase
        .from("user_daily_challenges")
        .select("challenge_id, completed")
        .eq("user_id", userId)
        .eq("challenge_date", today);

      const progressMap = new Map(userProgress?.map(p => [p.challenge_id, p.completed]) || []);
      
      setChallenges(challengesData?.map(c => ({
        ...c,
        completed: progressMap.get(c.id) || false
      })) || []);
    } else {
      setChallenges(challengesData || []);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error("Please sign in to complete challenges");
      navigate("/auth");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from("user_daily_challenges")
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        challenge_date: today,
        completed: true,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,challenge_id,challenge_date'
      });

    if (error) {
      console.error("Error completing challenge:", error);
      toast.error("Failed to complete challenge");
      return;
    }

    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, completed: true } : c
    ));

    const challenge = challenges.find(c => c.id === challengeId);
    toast.success(`Challenge completed! +${challenge?.points} points`);
  };

  const handleShareChallenge = async () => {
    const shareData = {
      title: 'Qurify - Daily Challenges',
      text: 'I\'m building my digital resilience with Qurify! Join me and complete daily challenges to become a misinformation expert. 🛡️',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Mark share challenge as complete
        const shareChallenge = challenges.find(c => c.challenge_type === 'social');
        if (shareChallenge && !shareChallenge.completed) {
          handleCompleteChallenge(shareChallenge.id);
        }
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success("Link copied to clipboard!");
      const shareChallenge = challenges.find(c => c.challenge_type === 'social');
      if (shareChallenge && !shareChallenge.completed) {
        handleCompleteChallenge(shareChallenge.id);
      }
    }
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.filter(c => c.completed).reduce((acc, c) => acc + c.points, 0);
  const progress = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-amber-400 bg-amber-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'verification': return '🔍';
      case 'game': return '🎮';
      case 'social': return '🤝';
      default: return '⭐';
    }
  };

  const getChallengeAction = (challenge: DailyChallenge) => {
    switch (challenge.challenge_type) {
      case 'verification':
        if (challenge.title.includes('Trust Score')) return () => navigate('/trust-score');
        if (challenge.title.includes('Claim')) return () => navigate('/claim-scanner');
        return () => navigate('/media-authenticator');
      case 'game':
        return () => navigate('/games');
      case 'social':
        return handleShareChallenge;
      default:
        return () => {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />

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
          <h1 className="text-lg font-display font-semibold text-foreground">Daily Challenges</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Stats Card */}
        <Card className="glass-card p-6 border-primary/20 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Today's Progress</h2>
                <p className="text-sm text-muted-foreground">Complete all challenges for bonus XP</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{completedCount} of {challenges.length} completed</span>
              <span className="text-primary font-semibold">{totalPoints} points earned</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {completedCount === challenges.length && challenges.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">All challenges completed! Great job!</span>
            </div>
          )}
        </Card>

        {/* Challenges List */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Today's Challenges
          </h3>

          {challenges.map((challenge, index) => (
            <Card
              key={challenge.id}
              className={`glass-card p-4 border-border/50 transition-all animate-slide-up ${
                challenge.completed ? 'opacity-75' : 'hover:border-primary/30'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  challenge.completed ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {challenge.completed ? <CheckCircle2 className="w-6 h-6 text-primary" /> : getChallengeIcon(challenge.challenge_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${challenge.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {challenge.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">+{challenge.points} pts</span>
                    {!challenge.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={getChallengeAction(challenge)}
                        className="text-xs h-8"
                      >
                        {challenge.challenge_type === 'social' ? (
                          <>
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </>
                        ) : (
                          'Start'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Tip Card */}
        <Card className="glass-card p-4 border-accent/20 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">Daily Reset</h4>
              <p className="text-xs text-muted-foreground">
                Challenges reset every day at midnight. Complete them all to build your streak!
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default DailyChallenges;
