import { useState } from "react";
import { Link2, Image, MessageSquareQuote, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ResilienceScore from "@/components/ResilienceScore";
import ToolCard from "@/components/ToolCard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleComingSoon = (toolName: string) => {
    toast({
      title: `${toolName} selected`,
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 pb-24 space-y-6">
        {/* Welcome Section */}
        <section className="animate-slide-up">
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            Stay Informed,
          </h1>
          <h2 className="text-2xl font-display font-bold text-gradient-primary">
            Stay Protected
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Verify content authenticity in real-time
          </p>
        </section>

        {/* Resilience Score */}
        <ResilienceScore score={42} />

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
            onClick={() => handleComingSoon("Image & Video Check")}
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
            onClick={() => handleComingSoon("Inoculation Games")}
            delay={400}
          />
        </section>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;