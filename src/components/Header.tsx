import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import factguardLogo from "@/assets/factguard-logo.png";
import MobileMenu from "@/components/MobileMenu";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={factguardLogo} 
              alt="FactGuard Logo" 
              className="w-10 h-10 object-contain rounded-lg"
            />
            <span className="font-display font-bold text-xl text-foreground">
              Fact<span className="text-primary">Guard</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary"
                onClick={() => navigate("/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary font-medium"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;