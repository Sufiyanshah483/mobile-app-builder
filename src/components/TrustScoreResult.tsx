import { Shield, CheckCircle, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustFactor {
  factor: string;
  assessment: "positive" | "neutral" | "negative";
  description: string;
}

interface TrustScoreResultProps {
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  source_name: string;
  summary: string;
  factors: TrustFactor[];
  recommendations: string[];
}

const TrustScoreResult = ({
  score,
  level,
  source_name,
  summary,
  factors,
  recommendations,
}: TrustScoreResultProps) => {
  const levelConfig = {
    HIGH: {
      color: "text-trust-high",
      bgColor: "bg-trust-high/10",
      borderColor: "border-trust-high/30",
      icon: CheckCircle,
      label: "High Trust",
    },
    MEDIUM: {
      color: "text-trust-medium",
      bgColor: "bg-trust-medium/10",
      borderColor: "border-trust-medium/30",
      icon: AlertTriangle,
      label: "Medium Trust",
    },
    LOW: {
      color: "text-trust-low",
      bgColor: "bg-trust-low/10",
      borderColor: "border-trust-low/30",
      icon: XCircle,
      label: "Low Trust",
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  const assessmentIcons = {
    positive: <CheckCircle className="w-4 h-4 text-trust-high" />,
    neutral: <AlertTriangle className="w-4 h-4 text-trust-medium" />,
    negative: <XCircle className="w-4 h-4 text-trust-low" />,
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main Score Card */}
      <div className={cn("rounded-2xl p-6 border-2", config.bgColor, config.borderColor)}>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("p-3 rounded-xl", config.bgColor)}>
            <Icon className={cn("w-8 h-8", config.color)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trust Score</p>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-4xl font-display font-bold", config.color)}>
                {score}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="ml-auto">
            <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium", config.bgColor, config.color)}>
              {config.label}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-display font-semibold text-foreground">{source_name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Factors */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Assessment Factors
        </h4>
        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
            >
              {assessmentIcons[factor.assessment]}
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{factor.factor}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h4 className="font-display font-semibold text-foreground mb-4">
          Recommendations
        </h4>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrustScoreResult;
