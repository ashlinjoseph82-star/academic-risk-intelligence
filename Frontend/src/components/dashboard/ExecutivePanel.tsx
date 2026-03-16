import { useEffect, useState } from "react";
import { useAppState } from "@/lib/app-state";
import { getModelInfo, mapModelName, type BackendPrediction, type ModelInfoResponse } from "@/lib/api";
import {
  getTotalEarned,
  getExpectedByTerm,
  DEGREE_OPTIONS
} from "@/lib/academic-rules";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

export function ExecutivePanel() {

  const { term, model, degree, credits, prediction } = useAppState();

  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);

  const termNum = parseInt(term.replace("Term ", "")) || 4;
  const modelKey = mapModelName(model);

  //--------------------------------------------------
  // CREDIT FEATURES
  //--------------------------------------------------

  const earnedCredits = getTotalEarned(credits);
  const expectedCredits = getExpectedByTerm(degree, termNum);

  const deviation = earnedCredits - expectedCredits;

  const totalCredits = DEGREE_OPTIONS[degree]?.totalCredits ?? 160;

  const completionPct = earnedCredits / totalCredits;

  //--------------------------------------------------
  // LOAD MODEL METRICS
  //--------------------------------------------------

  useEffect(() => {

    async function loadModelInfo() {

      try {

        const info = await getModelInfo();
        setModelInfo(info);

      } catch (err) {

        console.error("Model info failed:", err);

      }

    }

    loadModelInfo();

  }, []);

  //--------------------------------------------------
  // RISK DATA
  //--------------------------------------------------

  const probabilityRaw = prediction?.probability ?? 0;

  // Safety clamp
  const probabilityPct = Math.max(0, Math.min(100, Number(probabilityRaw) || 0));

  const riskLevel: BackendPrediction["risk_level"] = prediction?.risk_level ?? "Low";

  //--------------------------------------------------
  // COLOR LOGIC
  //--------------------------------------------------

  let probabilityColor = "text-green-400";
  let probabilityGlow = "drop-shadow-[0_0_6px_rgba(34,197,94,0.7)]";
  let gaugeColor = "hsl(155,70%,45%)";

  if (riskLevel === "Medium") {
    probabilityColor = "text-yellow-400";
    probabilityGlow = "drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]";
    gaugeColor = "hsl(40,85%,55%)";
  }

  if (riskLevel === "High") {
    probabilityColor = "text-red-400";
    probabilityGlow = "drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]";
    gaugeColor = "hsl(0,72%,55%)";
  }

  const gaugeData = [
    {
      value: probabilityPct,
      fill: gaugeColor,
    },
  ];

  //--------------------------------------------------
  // RISK BADGE
  //--------------------------------------------------

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

  //--------------------------------------------------
  // MODEL METRICS
  //--------------------------------------------------

  const metrics = modelInfo?.metrics?.[modelKey];

  const accuracy = metrics ? (metrics.accuracy * 100).toFixed(2) : "--";
  const f1 = metrics ? (metrics.f1 * 100).toFixed(2) : "--";
  const precision = metrics ? (metrics.precision * 100).toFixed(2) : "--";

  const recall = metrics
    ? ((metrics.recall ?? metrics.recall_delayed ?? 0) * 100).toFixed(2)
    : "--";

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

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

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-5">

            <MetricItem label="Risk Level" value={riskLevel} valueClass={riskColor} />
            <MetricItem label="Model Accuracy" value={`${accuracy}%`} />
            <MetricItem label="F1 Score" value={`${f1}%`} />
            <MetricItem label="Precision" value={`${precision}%`} />
            <MetricItem label="Recall" value={`${recall}%`} />

          </div>

          <div className="text-xs text-muted-foreground">
            Target Variable:
            <span className="font-medium">
              {" "}Graduation Outcome (On-Time vs Delayed)
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
                background={{ fill: "hsl(220,20%,15%)" }}
              />

            </RadialBarChart>

          </ResponsiveContainer>

          <p className={`text-center -mt-12 text-2xl font-bold font-mono ${probabilityColor} ${probabilityGlow}`}>
            {probabilityPct}%
          </p>

          <p className="text-center text-[10px] text-muted-foreground mt-0.5">
            Probability of Delay
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