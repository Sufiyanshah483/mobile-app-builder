import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ShieldAlert, 
  ShieldQuestion, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Lightbulb,
  Scan,
  ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManipulationIndicator {
  type: "artifact" | "inconsistency" | "metadata" | "pattern";
  description: string;
  severity: "low" | "medium" | "high";
}

interface AuthenticityFactor {
  factor: string;
  strength: "weak" | "moderate" | "strong";
}

interface TechnicalAnalysis {
  lighting_consistency: string;
  edge_artifacts: string;
  noise_patterns: string;
  compression_anomalies: string;
  facial_analysis: string;
  background_analysis: string;
}

interface MediaAuthenticatorResultProps {
  verdict: "authentic" | "likely_manipulated" | "likely_ai_generated" | "inconclusive";
  confidence: number;
  analysis_summary: string;
  manipulation_indicators: ManipulationIndicator[];
  authenticity_factors: AuthenticityFactor[];
  technical_analysis: TechnicalAnalysis;
  recommendations: string[];
  reverse_image_note: string;
  imagePreview?: string;
}

const MediaAuthenticatorResult = ({
  verdict,
  confidence,
  analysis_summary,
  manipulation_indicators,
  authenticity_factors,
  technical_analysis,
  recommendations,
  reverse_image_note,
  imagePreview
}: MediaAuthenticatorResultProps) => {
  const verdictConfig = {
    authentic: {
      color: "text-trust-high",
      bg: "bg-trust-high/10",
      border: "border-trust-high/30",
      icon: Shield,
      label: "Likely Authentic",
    },
    likely_manipulated: {
      color: "text-trust-low",
      bg: "bg-trust-low/10",
      border: "border-trust-low/30",
      icon: ShieldAlert,
      label: "Likely Manipulated",
    },
    likely_ai_generated: {
      color: "text-trust-medium",
      bg: "bg-trust-medium/10",
      border: "border-trust-medium/30",
      icon: Scan,
      label: "Likely AI Generated",
    },
    inconclusive: {
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      border: "border-border",
      icon: ShieldQuestion,
      label: "Inconclusive",
    },
  };

  const config = verdictConfig[verdict];
  const VerdictIcon = config.icon;

  const severityColors = {
    low: "bg-trust-high/20 text-trust-high border-trust-high/30",
    medium: "bg-trust-medium/20 text-trust-medium border-trust-medium/30",
    high: "bg-trust-low/20 text-trust-low border-trust-low/30",
  };

  const strengthColors = {
    weak: "text-muted-foreground",
    moderate: "text-trust-medium",
    strong: "text-trust-high",
  };

  const technicalLabels: Record<string, string> = {
    lighting_consistency: "Lighting Consistency",
    edge_artifacts: "Edge Artifacts",
    noise_patterns: "Noise Patterns",
    compression_anomalies: "Compression Anomalies",
    facial_analysis: "Facial Analysis",
    background_analysis: "Background Analysis",
  };

  const technicalValueColors: Record<string, string> = {
    consistent: "text-trust-high",
    natural: "text-trust-high",
    coherent: "text-trust-high",
    none: "text-trust-high",
    none_detected: "text-trust-high",
    not_applicable: "text-muted-foreground",
    unable_to_determine: "text-muted-foreground",
    minor: "text-trust-medium",
    mixed: "text-trust-medium",
    present: "text-trust-medium",
    inconsistent: "text-trust-low",
    artificial: "text-trust-low",
    significant: "text-trust-low",
    anomalies_detected: "text-trust-low",
    synthetic_indicators: "text-trust-low",
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Verdict Card */}
      <Card className={cn("border-2", config.border, config.bg)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {imagePreview && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img 
                  src={imagePreview} 
                  alt="Analyzed media" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2 rounded-full", config.bg)}>
                  <VerdictIcon className={cn("w-6 h-6", config.color)} />
                </div>
                <div>
                  <h3 className={cn("text-xl font-display font-bold", config.color)}>
                    {config.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {confidence}%
                  </p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed">
                {analysis_summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manipulation Indicators */}
      {manipulation_indicators.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-trust-low" />
              Manipulation Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {manipulation_indicators.map((indicator, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", severityColors[indicator.severity])}
                >
                  {indicator.severity}
                </Badge>
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {indicator.type}
                  </span>
                  <p className="text-sm text-foreground mt-0.5">
                    {indicator.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Authenticity Factors */}
      {authenticity_factors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-trust-high" />
              Authenticity Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {authenticity_factors.map((factor, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                <CheckCircle2 className={cn("w-4 h-4", strengthColors[factor.strength])} />
                <span className="text-sm text-foreground flex-1">{factor.factor}</span>
                <Badge variant="outline" className="text-xs">
                  {factor.strength}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Technical Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Technical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(technical_analysis).map(([key, value]) => (
              <div key={key} className="p-2 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground block">
                  {technicalLabels[key] || key}
                </span>
                <span className={cn(
                  "text-sm font-medium capitalize",
                  technicalValueColors[value] || "text-foreground"
                )}>
                  {value.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reverse Image Note */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Image Circulation
              </h4>
              <p className="text-sm text-muted-foreground">
                {reverse_image_note}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaAuthenticatorResult;
