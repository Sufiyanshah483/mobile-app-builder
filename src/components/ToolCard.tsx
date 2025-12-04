import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "primary" | "accent" | "default";
  onClick?: () => void;
  delay?: number;
}

const ToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  variant = "default",
  onClick,
  delay = 0 
}: ToolCardProps) => {
  const variants = {
    primary: "gradient-primary glow-primary",
    accent: "gradient-accent glow-accent",
    default: "bg-card border border-border hover:border-primary/50",
  };

  const iconVariants = {
    primary: "text-primary-foreground",
    accent: "text-accent-foreground",
    default: "text-primary",
  };

  const textVariants = {
    primary: "text-primary-foreground",
    accent: "text-accent-foreground",
    default: "text-foreground",
  };

  const descVariants = {
    primary: "text-primary-foreground/80",
    accent: "text-accent-foreground/80",
    default: "text-muted-foreground",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-2xl text-left transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        "animate-slide-up",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          variant === "default" ? "bg-primary/10" : "bg-white/20"
        )}>
          <Icon className={cn("w-6 h-6", iconVariants[variant])} />
        </div>
        <div className="flex-1">
          <h3 className={cn("font-display font-semibold text-lg mb-1", textVariants[variant])}>
            {title}
          </h3>
          <p className={cn("text-sm leading-relaxed", descVariants[variant])}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ToolCard;