import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  Home, 
  Shield, 
  Gamepad2, 
  User, 
  Trophy, 
  History, 
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Info,
  FileText,
  HelpCircle,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    onClose();
    navigate("/");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Qurify - Digital Source Verifier",
      text: "Check out Qurify! AI-powered content verification to combat misinformation.",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
    onClose();
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Shield, label: "Verify Content", path: "/verify" },
    { icon: Gamepad2, label: "Learn Games", path: "/games" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: History, label: "Verification History", path: "/history" },
    { icon: Award, label: "Achievements", path: "/achievements" },
  ];

  const userMenuItems = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const supportItems = [
    { icon: Info, label: "About Qurify", path: "/about" },
    { icon: HelpCircle, label: "Help Center", path: "/help" },
    { icon: FileText, label: "Privacy Policy", path: "/privacy" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-[300px] bg-card border-l border-border shadow-2xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display font-bold text-lg text-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-medium text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Navigation
          </p>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left text-foreground font-medium">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* User Section */}
        {user ? (
          <div className="p-4 border-t border-border space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Account
            </p>
            {userMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="flex-1 text-left text-foreground font-medium">
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors group mt-2"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="flex-1 text-left text-destructive font-medium">
                Sign Out
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-border">
            <Button 
              onClick={() => handleNavigate("/auth")}
              className="w-full gradient-primary text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Support Section */}
        <div className="p-4 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Support
          </p>
          {supportItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="flex-1 text-left text-foreground font-medium">
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <Share2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="flex-1 text-left text-foreground font-medium">
              Share Qurify
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            Qurify v1.0 • Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;