import { useNavigate } from "react-router-dom";
import { Link2, Image, MessageSquareQuote, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Verify = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: "trust-score",
      icon: Link2,
      title: "Trust Score",
      description: "Check the credibility of any news article or website instantly",
      gradient: "from-primary to-accent",
      path: "/trust-score",
    },
    {
      id: "media-check",
      icon: Image,
      title: "Image & Video Check",
      description: "Detect deepfakes and verify media authenticity",
      gradient: "from-accent to-primary",
      path: "/media-authenticator",
    },
    {
      id: "claim-scanner",
      icon: MessageSquareQuote,
      title: "Claim Scanner",
      description: "Fact-check quotes and claims against verified sources",
      gradient: "from-primary/80 to-accent/80",
      path: "/claim-scanner",
    },
  ];

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
          <h1 className="text-lg font-display font-semibold text-foreground">Verify Content</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-6 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Verification Tools
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Choose a tool to verify the authenticity of any content you encounter online
          </p>
        </section>

        {/* Tools Grid */}
        <section className="space-y-4">
          {tools.map((tool, index) => (
            <Card
              key={tool.id}
              className="glass-card p-5 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tool.description}
                  </p>
                </div>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Info Card */}
        <Card className="glass-card p-5 border-primary/20 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">AI-Powered Analysis</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Our verification tools use advanced AI to analyze content credibility, detect manipulation, and cross-reference with trusted fact-checking sources.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav activeTab="verify" />
    </div>
  );
};

export default Verify;
