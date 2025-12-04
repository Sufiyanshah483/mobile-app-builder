import { useState } from "react";
import { Link2, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import TrustScoreResult from "@/components/TrustScoreResult";
import { supabase } from "@/integrations/supabase/client";

interface TrustScoreData {
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  source_name: string;
  summary: string;
  factors: Array<{
    factor: string;
    assessment: "positive" | "neutral" | "negative";
    description: string;
  }>;
  recommendations: string[];
}

const TrustScore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrustScoreData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-trust-score", {
        body: { url: url.startsWith("http") ? url : `https://${url}` },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error("Error verifying URL:", error);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "An error occurred while analyzing the URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Link2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Trust Score</h1>
              <p className="text-xs text-muted-foreground">Verify news sources</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Input Section */}
        <div className="bg-card rounded-2xl border border-border p-5 animate-slide-up">
          <h2 className="font-display font-semibold text-foreground mb-2">
            Enter Article URL
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paste the URL of a news article or website to check its trustworthiness
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 text-base"
              disabled={isLoading}
            />
            
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Verify Source"
                )}
              </Button>
              {result && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-12"
                >
                  New Check
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-card rounded-2xl border border-border p-8 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-foreground">Analyzing Source</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Checking source reputation, history, and fact-check records...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <TrustScoreResult {...result} />
        )}

        {/* Info Section */}
        {!result && !isLoading && (
          <div className="bg-muted/50 rounded-2xl p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Enter the URL of a news article or website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Our AI analyzes source reputation, domain history, and fact-check records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Receive a Trust Score with detailed factors and recommendations</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrustScore;
