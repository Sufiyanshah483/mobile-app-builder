import { Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResilienceScoreProps {
  score: number;
  maxScore?: number;
}

const ResilienceScore = ({ score, maxScore = 100 }: ResilienceScoreProps) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Digital Resilience</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {score}<span className="text-base text-muted-foreground">/{maxScore}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            Level 2
          </span>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        Complete games to boost your score
      </p>
    </div>
  );
};

export default ResilienceScore;