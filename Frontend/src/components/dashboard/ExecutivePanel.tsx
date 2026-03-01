import { useEffect, useState } from "react";
import { useAppState } from "@/lib/app-state";
import {
  getCompletionPct,
  getExpectedByTerm,
  getTotalEarned,
  DEGREE_OPTIONS,
} from "@/lib/academic-rules";
import { predictStudent } from "@/lib/api";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

type BackendPrediction = {
  prediction: "On-Time" | "Delayed";
  probability: number; // already 0–100
  risk_level: "Low" | "Medium" | "High";
  model_version: string;
  model_used: string;
};

export function ExecutivePanel() {
  const { degree, term, credits, model } = useAppState();
  const [prediction, setPrediction] = useState<BackendPrediction | null>(null);

  const termNum = parseInt(term.replace("Term ", "")) || 4;
  const config = DEGREE_OPTIONS[degree];

  const totalEarned = getTotalEarned(credits);
  const expectedCredits = getExpectedByTerm(degree, termNum);
  const deviation = totalEarned - expectedCredits;

  // -----------------------------
  // Call Backend Prediction
  // -----------------------------
  useEffect(() => {
    async function runPrediction() {
      try {
        const result = await predictStudent({
          model, // 🔥 important
          semester: termNum,
          core_credits: credits.core ?? 0,
          pep_credits: credits.pep ?? 0,
          humanities_credits: credits.humanities ?? 0,
          internship_completed: 0,
          failed_courses: 0,
          total_credits: totalEarned,
          expected_credits: expectedCredits,
          deviation: deviation,
        });

        setPrediction(result);
      } catch (err) {
        console.error("Prediction failed:", err);
      }
    }

    runPrediction();
  }, [model, degree, term, credits]);

  // -----------------------------
  // Derived UI Values
  // -----------------------------
  const completion = getCompletionPct(degree, credits);
  const expectedPct = config
    ? Math.round((expectedCredits / config.totalCredits) * 100)
    : 0;

  const riskLevel = prediction?.risk_level ?? "Medium";
  const probabilityPct = prediction?.probability ?? 0; // 🔥 already %

  const riskColor =
    riskLevel === "Low"
      ? "text-success"
      : riskLevel === "Medium"
      ? "text-warning"
      : "text-destructive";

  const riskBg =
    riskLevel === "Low"
      ? "bg-success/10 border-success/20"
      : riskLevel === "Medium"
      ? "bg-warning/10 border-warning/20"
      : "bg-destructive/10 border-destructive/20";

  const RiskIcon =
    riskLevel === "Low"
      ? Shield
      : riskLevel === "Medium"
      ? AlertTriangle
      : AlertCircle;

  const statusLabel =
    riskLevel === "Low"
      ? "Eligible"
      : riskLevel === "Medium"
      ? "Attention Needed"
      : "At Risk";

  const gaugeData = [
    {
      value: probabilityPct,
      fill:
        riskLevel === "Low"
          ? "hsl(155, 70%, 45%)"
          : riskLevel === "Medium"
          ? "hsl(40, 85%, 55%)"
          : "hsl(0, 72%, 55%)",
    },
  ];

  return (
    <div className="glass-card-glow p-5 animate-fade-in-up">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              Executive Command Panel
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskBg} ${riskColor}`}
            >
              <RiskIcon className="h-3 w-3" />
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-4">
            <MetricItem
              label="Risk Level"
              value={riskLevel}
              valueClass={riskColor}
            />
            <MetricItem
              label="AI Prediction"
              value={`${probabilityPct}%`}
              valueClass="text-primary"
            />
            <MetricItem
              label="Model Used"
              value={prediction?.model_used ?? model}
              valueClass="text-accent"
            />
            <MetricItem
              label="Completion"
              value={`${completion}%`}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Expected Progress:{" "}
              <span className="font-medium">
                {expectedPct}%
              </span>
            </span>
            <span>•</span>
            <span>
              Deviation:{" "}
              <span
                className={
                  completion >= expectedPct
                    ? "text-success"
                    : "text-warning"
                }
              >
                {completion - expectedPct > 0 ? "+" : ""}
                {completion - expectedPct}%
              </span>
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 w-[130px] h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={gaugeData}
              barSize={8}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                background={{ fill: "hsl(220, 20%, 15%)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-center -mt-12 text-2xl font-bold font-mono">
            {probabilityPct}%
          </p>
          <p className="text-center text-[10px] text-muted-foreground mt-0.5">
            Prediction Score
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`text-lg font-semibold font-mono ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}