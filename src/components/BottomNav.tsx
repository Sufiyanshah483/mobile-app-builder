import { Home, Search, Gamepad2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all",
      active 
        ? "text-primary" 
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    <Icon className={cn("w-5 h-5", active && "animate-scale-in")} />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "verify", icon: Search, label: "Verify" },
    { id: "learn", icon: Gamepad2, label: "Learn" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
      <div className="container flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;