import { ArrowLeft, Shield, Target, Users, Zap, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import qurifyLogo from "@/assets/qurify-logo.png";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Trust Score",
      description: "Instantly verify the credibility of any news source or website."
    },
    {
      icon: Target,
      title: "Claim Scanner",
      description: "Cross-reference claims against verified fact-checking databases."
    },
    {
      icon: Zap,
      title: "Media Authenticator",
      description: "Detect deepfakes and manipulated media using AI analysis."
    },
    {
      icon: Users,
      title: "Inoculation Games",
      description: "Build resilience against misinformation through interactive learning."
    }
  ];

  const values = [
    { icon: Heart, label: "Truth First", description: "We prioritize accuracy and transparency" },
    { icon: Globe, label: "Accessible", description: "Free tools for everyone to verify content" },
    { icon: Shield, label: "Privacy", description: "Your data stays yours - always encrypted" }
  ];

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
          <h1 className="text-lg font-display font-semibold text-foreground">About Qurify</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-8 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 animate-slide-up">
          <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img src={qurifyLogo} alt="Qurify Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Quri<span className="text-primary">fy</span>
            </h2>
            <p className="text-muted-foreground mt-1">Digital Source Verifier</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Empowering users with AI-powered tools to combat misinformation, 
            deepfakes, and low-trust content in the digital age.
          </p>
        </section>

        {/* Mission */}
        <Card className="glass-card p-6 border-primary/20 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-display font-bold text-lg text-foreground mb-3">Our Mission</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In an era of information overload, Qurify provides accessible, real-time tools 
            to assess the trustworthiness of digital content. We aim to increase user 
            resilience against online manipulation and encourage informed sharing of content.
          </p>
        </Card>

        {/* Features */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="font-display font-bold text-lg text-foreground">Core Features</h3>
          <div className="grid gap-3">
            {features.map((feature, index) => (
              <Card key={feature.title} className="glass-card p-4 border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="space-y-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-display font-bold text-lg text-foreground">Our Values</h3>
          <div className="grid grid-cols-3 gap-3">
            {values.map((value) => (
              <Card key={value.label} className="glass-card p-4 border-border/50 text-center">
                <value.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground text-sm">{value.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{value.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Version Info */}
        <section className="text-center space-y-2 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground">Built with ❤️ for digital truth</p>
          <p className="text-xs text-muted-foreground">© 2025 Qurify. All rights reserved.</p>
        </section>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default About;