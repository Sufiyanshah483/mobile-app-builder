import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History as HistoryIcon, Link2, Image, MessageSquareQuote, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface VerificationRecord {
  id: string;
  verification_type: string;
  input_content: string;
  result_score: string | null;
  result_verdict: string | null;
  result_details: any;
  created_at: string;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("verification_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "trust_score":
        return <Link2 className="w-5 h-5 text-primary" />;
      case "media_analysis":
        return <Image className="w-5 h-5 text-accent" />;
      case "claim_scan":
        return <MessageSquareQuote className="w-5 h-5 text-warning" />;
      default:
        return <HistoryIcon className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "trust_score":
        return "Trust Score";
      case "media_analysis":
        return "Media Check";
      case "claim_scan":
        return "Claim Scan";
      default:
        return type;
    }
  };

  const getVerdictStyle = (verdict: string | null) => {
    if (!verdict) return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" };
    
    const v = verdict.toUpperCase();
    if (v === "TRUE" || v === "HIGH" || v === "AUTHENTIC") {
      return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" };
    } else if (v === "FALSE" || v === "LOW" || v === "MANIPULATED") {
      return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" };
    }
    return { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" };
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return d.toLocaleDateString();
  };

  const filteredHistory = filter === "all" 
    ? history 
    : history.filter(h => h.verification_type === filter);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "trust_score", label: "Trust Score" },
    { value: "media_analysis", label: "Media" },
    { value: "claim_scan", label: "Claims" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-ambient pointer-events-none" />

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
          <h1 className="text-lg font-display font-semibold text-foreground">Verification History</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container px-4 py-6 pb-24 space-y-6 relative z-10">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <Card className="glass-card p-4 text-center border-primary/20">
            <p className="text-2xl font-bold text-primary">{history.length}</p>
            <p className="text-xs text-muted-foreground">Total Checks</p>
          </Card>
          <Card className="glass-card p-4 text-center border-success/20">
            <p className="text-2xl font-bold text-success">
              {history.filter(h => 
                h.result_score?.toUpperCase() === "TRUE" || 
                h.result_score?.toUpperCase() === "HIGH"
              ).length}
            </p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </Card>
          <Card className="glass-card p-4 text-center border-destructive/20">
            <p className="text-2xl font-bold text-destructive">
              {history.filter(h => 
                h.result_score?.toUpperCase() === "FALSE" || 
                h.result_score?.toUpperCase() === "LOW"
              ).length}
            </p>
            <p className="text-xs text-muted-foreground">Flagged</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar animate-slide-up" style={{ animationDelay: "50ms" }}>
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={filter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(opt.value)}
              className={filter === opt.value ? "gradient-primary text-primary-foreground" : ""}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading history...</div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card className="glass-card p-8 text-center animate-slide-up">
              <HistoryIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">No verification history yet</p>
              <Button
                variant="outline"
                onClick={() => navigate("/verify")}
              >
                Start Verifying
              </Button>
            </Card>
          ) : (
            filteredHistory.map((record, index) => {
              const verdictStyle = getVerdictStyle(record.result_score);
              return (
                <Card
                  key={record.id}
                  className="glass-card p-4 border-border/50 hover:border-primary/30 transition-all animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(record.verification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {getTypeName(record.verification_type)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(record.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium truncate mb-2">
                        {record.input_content.length > 60 
                          ? record.input_content.substring(0, 60) + "..." 
                          : record.input_content}
                      </p>
                      {record.result_score && (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${verdictStyle.bg} ${verdictStyle.color}`}>
                          <verdictStyle.icon className="w-3 h-3" />
                          {record.result_score}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default History;
