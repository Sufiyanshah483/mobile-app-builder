import { useState } from "react";
import { MessageSquareQuote, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ClaimScannerResult from "@/components/ClaimScannerResult";
import { supabase } from "@/integrations/supabase/client";

interface ClaimScanData {
  extracted_claim: string;
  verdict: "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE" | "UNVERIFIABLE";
  confidence: number;
  summary: string;
  evidence: Array<{
    type: "supporting" | "contradicting" | "contextual";
    description: string;
    source_type: string;
  }>;
  fact_check_sources?: Array<{
    name: string;
    verdict: string;
    url_hint?: string;
  }>;
  verification_tips: string[];
}

const ClaimScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claim, setClaim] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClaimScanData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!claim.trim()) {
      toast({
        title: "Claim required",
        description: "Please enter a claim or quote to verify",
        variant: "destructive",
      });
      return;
    }

    if (claim.trim().length < 10) {
      toast({
        title: "Claim too short",
        description: "Please enter a more detailed claim to verify",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("scan-claim", {
        body: { claim: claim.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (error) {
      console.error("Error scanning claim:", error);
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "An error occurred while analyzing the claim",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setClaim("");
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
            <div className="p-2 rounded-xl bg-card border border-border">
              <MessageSquareQuote className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Claim Scanner</h1>
              <p className="text-xs text-muted-foreground">Fact-check quotes & claims</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Input Section */}
        <div className="bg-card rounded-2xl border border-border p-5 animate-slide-up">
          <h2 className="font-display font-semibold text-foreground mb-2">
            Enter Claim to Verify
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paste a quote, claim, or statement to check its accuracy
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder='e.g., "The Great Wall of China is visible from space"'
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              className="min-h-[120px] text-base resize-none"
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
                  "Fact-Check Claim"
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
                <p className="font-display font-semibold text-foreground">Fact-Checking Claim</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cross-referencing with fact-check databases and evidence...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <ClaimScannerResult {...result} />
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
                <span>Enter a claim, quote, or statement you want to verify</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Our AI extracts the verifiable claim and cross-references fact-check databases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Receive a verdict with evidence and tips to verify it yourself</span>
              </li>
            </ul>
          </div>
        )}

        {/* Example Claims */}
        {!result && !isLoading && (
          <div className="bg-card rounded-2xl border border-border p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="font-display font-semibold text-foreground mb-3">
              Try These Examples
            </h3>
            <div className="space-y-2">
              {[
                "The Great Wall of China is visible from space",
                "Humans only use 10% of their brain",
                "Lightning never strikes the same place twice",
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setClaim(example)}
                  className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClaimScanner;
