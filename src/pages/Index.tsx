import { Link2, Image, MessageSquareQuote, Gamepad2, History, Award, Flame, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ResilienceScore from "@/components/ResilienceScore";
import ToolCard from "@/components/ToolCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const handleShare = async () => {
    const shareData = {
      title: 'Qurify - Digital Source Verifier',
      text: 'Build your digital resilience with Qurify! Verify news, detect deepfakes, and become a misinformation expert. 🛡️',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Thanks for sharing Qurify!");
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />
      
      <Header />
      
      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Welcome Section */}
        <section className="animate-slide-up">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Stay Informed,
          </h1>
          <h2 className="text-2xl font-display font-bold text-gradient-primary">
            Stay Protected
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Verify content authenticity in real-time with Qurify
          </p>
        </section>

        {/* Resilience Score */}
        <ResilienceScore score={42} />

        {/* Daily Challenges Highlight */}
        <Card 
          className="glass-card p-4 border-accent/30 cursor-pointer hover:border-accent/50 transition-all animate-slide-up"
          onClick={() => navigate("/daily-challenges")}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Daily Challenges</h3>
              <p className="text-xs text-muted-foreground">Complete today's tasks for bonus points!</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-medium">New</span>
          </div>
        </Card>

        {/* Main Tools */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Verification Tools
          </h3>
          
          <ToolCard
            icon={Link2}
            title="Trust Score"
            description="Check the credibility of any news article or website instantly"
            variant="primary"
            onClick={() => navigate("/trust-score")}
            delay={100}
          />

          <ToolCard
            icon={Image}
            title="Image & Video Check"
            description="Detect deepfakes and verify media authenticity"
            variant="default"
            onClick={() => navigate("/media-authenticator")}
            delay={200}
          />

          <ToolCard
            icon={MessageSquareQuote}
            title="Claim Scanner"
            description="Fact-check quotes and claims against verified sources"
            variant="default"
            onClick={() => navigate("/claim-scanner")}
            delay={300}
          />
        </section>

        {/* Learning Section */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Build Your Skills
          </h3>
          
          <ToolCard
            icon={Gamepad2}
            title="Inoculation Games"
            description="Learn to spot misinformation through interactive challenges"
            variant="accent"
            onClick={() => navigate("/games")}
            delay={400}
          />
        </section>

        {/* Quick Access */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Access
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <ToolCard
              icon={History}
              title="History"
              description="View past verifications"
              variant="default"
              onClick={() => navigate("/history")}
              delay={500}
            />
            
            <ToolCard
              icon={Award}
              title="Achievements"
              description="Track your progress"
              variant="default"
              onClick={() => navigate("/achievements")}
              delay={600}
            />
          </div>
        </section>

        {/* Share Section */}
        <section className="animate-slide-up" style={{ animationDelay: "700ms" }}>
          <Card className="glass-card p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-sm">Share Qurify</h4>
                <p className="text-xs text-muted-foreground">Help others stay protected</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleShare}>
                Share
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;