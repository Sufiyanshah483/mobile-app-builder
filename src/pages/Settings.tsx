import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  HelpCircle, 
  FileText, 
  LogOut,
  ChevronRight,
  Trash2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoVerify, setAutoVerify] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    // In a real app, you'd call an edge function to delete the user
    toast.info("Account deletion request submitted. This feature requires backend implementation.");
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile Settings",
          description: "Edit your display name and avatar",
          action: () => navigate("/profile"),
          type: "link" as const,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          description: "Receive alerts for new features",
          value: notifications,
          onChange: setNotifications,
          type: "toggle" as const,
        },
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          description: "Toggle dark/light theme",
          value: darkMode,
          onChange: (val: boolean) => {
            setDarkMode(val);
            toast.info("Theme preference saved (visual toggle coming soon)");
          },
          type: "toggle" as const,
        },
        {
          icon: Shield,
          label: "Auto-Verify Links",
          description: "Automatically check shared links",
          value: autoVerify,
          onChange: setAutoVerify,
          type: "toggle" as const,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          description: "FAQs and tutorials",
          action: () => toast.info("Help center coming soon!"),
          type: "link" as const,
        },
        {
          icon: FileText,
          label: "Privacy Policy",
          description: "How we protect your data",
          action: () => toast.info("Privacy policy page coming soon!"),
          type: "link" as const,
        },
        {
          icon: Info,
          label: "About FactGuard",
          description: "Version 1.0 • Built with AI",
          action: () => toast.info("FactGuard v1.0 - Your digital truth companion"),
          type: "link" as const,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container flex items-center justify-between py-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-display font-semibold text-foreground">Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* User Card */}
        {user && (
          <Card className="glass-card p-4 border-primary/20 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="border-primary/30 text-primary"
              >
                Edit
              </Button>
            </div>
          </Card>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <section 
            key={group.title} 
            className="space-y-3 animate-slide-up"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {group.title}
            </h3>
            <Card className="glass-card border-border/50 overflow-hidden">
              {group.items.map((item, itemIndex) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 p-4 ${
                    itemIndex < group.items.length - 1 ? "border-b border-border/30" : ""
                  } ${item.type === "link" ? "cursor-pointer hover:bg-muted/30 transition-colors" : ""}`}
                  onClick={item.type === "link" ? item.action : undefined}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === "toggle" && (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  )}
                  {item.type === "link" && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </Card>
          </section>
        ))}

        {/* Danger Zone */}
        {user && (
          <section className="space-y-3 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider px-1">
              Danger Zone
            </h3>
            <Card className="glass-card border-destructive/30 overflow-hidden">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-destructive/5 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently remove your data</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-destructive/50" />
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-strong border-destructive/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your data, game progress, and achievements will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-muted text-foreground">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </section>
        )}

        {/* Sign Out Button */}
        {user ? (
          <section className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Button
              variant="outline"
              className="w-full h-12 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </section>
        ) : (
          <section className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Button
              className="w-full h-12 gradient-primary text-primary-foreground"
              onClick={() => navigate("/auth")}
            >
              Sign In to Access All Features
            </Button>
          </section>
        )}

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            FactGuard v1.0.0 • Made with ❤️ for digital truth
          </p>
        </div>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Settings;