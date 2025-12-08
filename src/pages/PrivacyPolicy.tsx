import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: "Data We Collect",
      content: [
        "Account information (email, display name) when you register",
        "Content you submit for verification (URLs, claims, media)",
        "Game progress and achievement data",
        "App usage analytics (anonymized)"
      ]
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: [
        "All data is encrypted in transit using TLS 1.3",
        "Data at rest is encrypted using AES-256",
        "We never sell your personal information",
        "Access to data is strictly controlled"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Data",
      content: [
        "To provide verification services",
        "To track your learning progress",
        "To improve our AI models (anonymized)",
        "To send notifications (if enabled)"
      ]
    },
    {
      icon: Shield,
      title: "Your Rights",
      content: [
        "Access your personal data anytime",
        "Request correction of inaccurate data",
        "Delete your account and all associated data",
        "Export your data in portable format"
      ]
    },
    {
      icon: Trash2,
      title: "Data Retention",
      content: [
        "Verification history: 90 days (or until you delete)",
        "Account data: Until account deletion",
        "Analytics: 12 months (anonymized)",
        "Game progress: Until account deletion"
      ]
    }
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
          <h1 className="text-lg font-display font-semibold text-foreground">Privacy Policy</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Last Updated */}
        <Card className="glass-card p-4 border-primary/20 animate-slide-up">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Last Updated:</span> December 8, 2025
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            At Qurify, we take your privacy seriously. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
        </Card>

        {/* Sections */}
        {sections.map((section, index) => (
          <Card 
            key={section.title} 
            className="glass-card p-4 border-border/50 animate-slide-up"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.content.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}

        {/* Contact */}
        <Card className="glass-card p-4 border-border/50 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-bold text-foreground">Contact Us</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Questions about our privacy practices? Contact our Data Protection Officer at{" "}
            <span className="text-primary">privacy@qurify.app</span>
          </p>
        </Card>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            By using Qurify, you agree to this Privacy Policy.
          </p>
        </div>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default PrivacyPolicy;