import { useState } from "react";
import { ArrowLeft, Search, HelpCircle, Shield, Image, MessageSquare, Gamepad2, User, ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const categories = [
    { icon: Shield, label: "Trust Score", color: "text-green-400" },
    { icon: Image, label: "Media Check", color: "text-blue-400" },
    { icon: MessageSquare, label: "Claim Scanner", color: "text-purple-400" },
    { icon: Gamepad2, label: "Games", color: "text-orange-400" },
    { icon: User, label: "Account", color: "text-cyan-400" },
  ];

  const faqs = [
    {
      id: "1",
      category: "Trust Score",
      question: "How is the Trust Score calculated?",
      answer: "Our AI analyzes multiple factors including source reputation, historical accuracy, fact-check database cross-referencing, and domain age. The score ranges from 0-100, with higher scores indicating more trustworthy sources."
    },
    {
      id: "2",
      category: "Trust Score",
      question: "Why does a legitimate site have a low score?",
      answer: "New websites or niche publications may have lower scores due to limited historical data. The score improves as more verification data becomes available. You can also manually verify content through our Claim Scanner."
    },
    {
      id: "3",
      category: "Media Check",
      question: "What types of deepfakes can Qurify detect?",
      answer: "Our AI can detect face-swapped images, AI-generated faces, manipulated videos, and altered metadata. However, AI detection is constantly evolving, and we recommend using multiple verification methods."
    },
    {
      id: "4",
      category: "Media Check",
      question: "Can I verify videos from social media?",
      answer: "Yes! Simply copy the video URL or upload the video file directly. Our system will analyze the content and check for signs of manipulation."
    },
    {
      id: "5",
      category: "Claim Scanner",
      question: "Which fact-checking organizations do you use?",
      answer: "We cross-reference claims against IFCN-certified fact-checkers including PolitiFact, Snopes, FactCheck.org, AFP Fact Check, and many more regional organizations."
    },
    {
      id: "6",
      category: "Games",
      question: "How do Inoculation Games help me?",
      answer: "Based on psychological research, these games expose you to weakened forms of misinformation tactics, building your 'immunity' to manipulation. Studies show this approach significantly improves misinformation detection."
    },
    {
      id: "7",
      category: "Account",
      question: "How do I delete my account and data?",
      answer: "Go to Settings > Danger Zone > Delete Account. This will permanently remove all your data including verification history, game progress, and achievements. This action cannot be undone."
    },
    {
      id: "8",
      category: "Account",
      question: "Is my verification history private?",
      answer: "Yes, your verification history is completely private and only visible to you. We don't share individual verification data with anyone."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-lg font-display font-semibold text-foreground">Help Center</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Categories */}
        <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Browse by Category
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSearchQuery(cat.label)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 hover:border-primary/50 transition-colors whitespace-nowrap"
              >
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-sm text-foreground">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Frequently Asked Questions
          </h3>
          {filteredFaqs.length === 0 ? (
            <Card className="glass-card p-6 border-border/50 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-primary"
              >
                Clear search
              </Button>
            </Card>
          ) : (
            filteredFaqs.map((faq) => (
              <Card key={faq.id} className="glass-card border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-primary uppercase tracking-wider">{faq.category}</span>
                    <p className="font-medium text-foreground mt-1">{faq.question}</p>
                  </div>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground pl-8">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </section>

        {/* Contact Support */}
        <section className="space-y-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Need More Help?
          </h3>
          <Card className="glass-card p-4 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Contact Support</h4>
                <p className="text-xs text-muted-foreground">We typically respond within 24 hours</p>
              </div>
              <Button 
                size="sm" 
                className="gradient-primary text-primary-foreground"
                onClick={() => window.location.href = 'mailto:sufiyanshah4545@gmail.com?subject=Qurify Support Request'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default HelpCenter;