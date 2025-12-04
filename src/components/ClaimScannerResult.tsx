import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  FileText,
  Lightbulb,
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Evidence {
  type: "supporting" | "contradicting" | "contextual";
  description: string;
  source_type: string;
}

interface FactCheckSource {
  name: string;
  verdict: string;
  url_hint?: string;
}

interface ClaimScannerResultProps {
  extracted_claim: string;
  verdict: "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE" | "UNVERIFIABLE";
  confidence: number;
  summary: string;
  evidence: Evidence[];
  fact_check_sources?: FactCheckSource[];
  verification_tips: string[];
}

const ClaimScannerResult = ({
  extracted_claim,
  verdict,
  confidence,
  summary,
  evidence,
  fact_check_sources,
  verification_tips,
}: ClaimScannerResultProps) => {
  const verdictConfig = {
    TRUE: {
      color: "text-trust-high",
      bgColor: "bg-trust-high/10",
      borderColor: "border-trust-high/30",
      icon: CheckCircle,
      label: "True",
    },
    MOSTLY_TRUE: {
      color: "text-trust-high",
      bgColor: "bg-trust-high/10",
      borderColor: "border-trust-high/30",
      icon: CheckCircle,
      label: "Mostly True",
    },
    MIXED: {
      color: "text-trust-medium",
      bgColor: "bg-trust-medium/10",
      borderColor: "border-trust-medium/30",
      icon: AlertTriangle,
      label: "Mixed",
    },
    MOSTLY_FALSE: {
      color: "text-trust-low",
      bgColor: "bg-trust-low/10",
      borderColor: "border-trust-low/30",
      icon: XCircle,
      label: "Mostly False",
    },
    FALSE: {
      color: "text-trust-low",
      bgColor: "bg-trust-low/10",
      borderColor: "border-trust-low/30",
      icon: XCircle,
      label: "False",
    },
    UNVERIFIABLE: {
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
      icon: HelpCircle,
      label: "Unverifiable",
    },
  };

  const config = verdictConfig[verdict];
  const Icon = config.icon;

  const evidenceIcons = {
    supporting: <CheckCircle className="w-4 h-4 text-trust-high" />,
    contradicting: <XCircle className="w-4 h-4 text-trust-low" />,
    contextual: <AlertTriangle className="w-4 h-4 text-trust-medium" />,
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main Verdict Card */}
      <div className={cn("rounded-2xl p-6 border-2", config.bgColor, config.borderColor)}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("p-3 rounded-xl", config.bgColor)}>
            <Icon className={cn("w-8 h-8", config.color)} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Verdict</p>
            <h2 className={cn("text-2xl font-display font-bold", config.color)}>
              {config.label}
            </h2>
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium text-foreground">{confidence}%</span>
          </div>
          <Progress value={confidence} className="h-2" />
        </div>
        
        {/* Extracted Claim */}
        <div className="p-3 rounded-xl bg-background/50 border border-border/50 mb-3">
          <p className="text-xs text-muted-foreground mb-1">Analyzed Claim</p>
          <p className="text-sm font-medium text-foreground italic">"{extracted_claim}"</p>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
      </div>

      {/* Evidence */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Evidence Considered
        </h4>
        <div className="space-y-3">
          {evidence.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
            >
              {evidenceIcons[item.type]}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.source_type}</span>
                </div>
                <p className="text-sm text-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fact-Check Sources */}
      {fact_check_sources && fact_check_sources.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Fact-Check Sources
          </h4>
          <div className="space-y-2">
            {fact_check_sources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
              >
                <span className="font-medium text-foreground text-sm">{source.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {source.verdict}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Tips */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Verify It Yourself
        </h4>
        <ul className="space-y-2">
          {verification_tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClaimScannerResult;
