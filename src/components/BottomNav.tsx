import { Home, Search, Gamepad2, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
    <div className={cn(
      "relative",
      active && "after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
    )}>
      <Icon className={cn("w-5 h-5", active && "animate-scale-in")} />
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab?: string;
}

const BottomNav = ({ activeTab }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "verify", icon: Search, label: "Verify", path: "/verify" },
    { id: "learn", icon: Gamepad2, label: "Learn", path: "/games" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  const getCurrentTab = () => {
    if (activeTab) return activeTab;
    const currentPath = location.pathname;
    if (currentPath === "/") return "home";
    if (currentPath.startsWith("/verify") || currentPath.startsWith("/trust-score") || currentPath.startsWith("/claim-scanner") || currentPath.startsWith("/media-authenticator")) return "verify";
    if (currentPath.startsWith("/games") || currentPath.startsWith("/leaderboard")) return "learn";
    if (currentPath.startsWith("/profile")) return "profile";
    return "home";
  };

  const currentTab = getCurrentTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
      <div className="container flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={currentTab === tab.id}
            onClick={() => navigate(tab.path)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;