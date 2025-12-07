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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);

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
    onClose();
    navigate("/");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-[280px] bg-card border-l border-border shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-display font-bold text-lg text-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
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

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            FactGuard v1.0 • Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
