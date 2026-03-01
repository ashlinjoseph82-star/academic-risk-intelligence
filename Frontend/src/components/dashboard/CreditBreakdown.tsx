import { useAppState } from "@/lib/app-state";
import { getCreditCategories } from "@/lib/academic-rules";
import { CheckCircle2, Clock, Lock } from "lucide-react";

export function CreditBreakdown() {
  const { degree, credits } = useAppState();
  const categories = getCreditCategories(degree, credits);

  return (
    <div className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <h3 className="text-sm font-semibold text-foreground mb-3">Credit Breakdown</h3>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_60px_60px_1fr_80px] gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Category</span>
          <span className="text-right">Required</span>
          <span className="text-right">Earned</span>
          <span className="text-right">Remaining</span>
          <span>Progress</span>
          <span className="text-center">Status</span>
        </div>

        <div className="neon-line" />

        {categories.map((cat) => {
          const remaining = Math.max(0, cat.required - cat.earned);
          const pct = Math.min(100, Math.round((cat.earned / cat.required) * 100));
          const StatusIcon = cat.status === "completed" ? CheckCircle2 : cat.status === "pending" ? Clock : Lock;
          const statusColor = cat.status === "completed" ? "text-success" : cat.status === "pending" ? "text-warning" : "text-muted-foreground";
          const barColor = cat.status === "completed" ? "hsl(155, 70%, 45%)" : cat.status === "pending" ? "hsl(185, 75%, 50%)" : "hsl(215, 15%, 30%)";

          return (
            <div
              key={cat.key}
              className={`grid grid-cols-[1fr_60px_60px_60px_1fr_80px] gap-2 items-center px-2 py-2 rounded-md transition-colors hover:bg-muted/30 ${
                cat.status === "locked" ? "opacity-50" : ""
              }`}
            >
              <span className="text-xs font-medium text-card-foreground">{cat.label}</span>
              <span className="text-xs text-right font-mono text-muted-foreground">{cat.required}</span>
              <span className="text-xs text-right font-mono text-foreground">{cat.earned}</span>
              <span className="text-xs text-right font-mono text-muted-foreground">{remaining}</span>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: barColor,
                    boxShadow: cat.status === "completed" ? `0 0 8px ${barColor}` : "none",
                  }}
                />
              </div>
              <div className="flex items-center justify-center gap-1">
                <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                <span className={`text-[10px] capitalize ${statusColor}`}>{cat.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
