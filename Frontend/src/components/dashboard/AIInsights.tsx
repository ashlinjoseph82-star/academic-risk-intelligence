import { useEffect, useState } from "react";
import { useAppState } from "@/lib/app-state";
import { predictRisk, type PredictionResponse } from "@/lib/api";
import { getCompletionPct, getExpectedByTerm, DEGREE_OPTIONS } from "@/lib/academic-rules";
import { Sparkles, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";

export function AIInsights() {
  const { degree, term, model, credits } = useAppState();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  useEffect(() => {
    predictRisk({ model, degree, term, credits }).then(setPrediction);
  }, [model, degree, term, credits]);

  const termNum = parseInt(term.replace("Term ", "")) || 4;
  const completion = getCompletionPct(degree, credits);
  const config = DEGREE_OPTIONS[degree];
  const expectedPct = config ? Math.round((getExpectedByTerm(degree, termNum) / config.totalCredits) * 100) : 0;
  const deviation = completion - expectedPct;

  const insights = prediction?.insights ?? [];
  const icons = [TrendingDown, AlertTriangle, Lightbulb, Sparkles];

  return (
    <div className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">AI Academic Insights</h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const Icon = icons[i % icons.length];
          return (
            <div key={i} className="flex items-start gap-2.5 rounded-md bg-muted/40 px-3 py-2">
              <Icon className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
              <p className="text-xs text-card-foreground leading-relaxed">{insight}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border/50 pt-2.5">
        <span>Trajectory Deviation: <span className={deviation >= 0 ? "text-success" : "text-warning"}>{deviation > 0 ? "+" : ""}{deviation}%</span></span>
        <span>•</span>
        <span>Model: <span className="text-primary font-mono">{model}</span></span>
      </div>
    </div>
  );
}
