import { useAppState } from "@/lib/app-state";
import {
  getTotalEarned,
  getExpectedByTerm,
  getCompletionPct,
  DEGREE_OPTIONS,
  FIXED_REQUIREMENTS,
} from "@/lib/academic-rules";
import { predictRisk, type PredictionResponse } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

const COLORS = [
  "hsl(185, 75%, 50%)",
  "hsl(255, 55%, 58%)",
  "hsl(155, 70%, 45%)",
];

const AcademicAnalytics = () => {
  const { degree, term, model, credits } = useAppState();
  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

  const config = DEGREE_OPTIONS[degree];
  const termNum = parseInt(term.replace("Term ", "")) || 4;

  useEffect(() => {
    let mounted = true;

    async function runPrediction() {
      try {
        const result = await predictRisk({
          model,
          degree,
          term,
          credits,
        });

        if (mounted) setPrediction(result);
      } catch (err) {
        console.error("Analytics prediction failed:", err);
      }
    }

    runPrediction();

    return () => {
      mounted = false;
    };
  }, [model, degree, term, credits]);

  if (!config) return null;

  const totalEarned = getTotalEarned(credits);
  const completion = getCompletionPct(degree, credits);

  // -------------------------
  // Credit Distribution
  // -------------------------
  const experiential =
    credits.pep +
    credits.sip +
    credits.shortIIP +
    credits.longIIP +
    credits.ee +
    credits.ri;

  const experientialTotal =
    FIXED_REQUIREMENTS.pep +
    FIXED_REQUIREMENTS.sip +
    FIXED_REQUIREMENTS.shortIIP +
    FIXED_REQUIREMENTS.longIIP +
    FIXED_REQUIREMENTS.ee +
    FIXED_REQUIREMENTS.ri;

  const donutData = [
    { name: "Core", value: credits.core },
    { name: "GE", value: credits.ge },
    { name: "Experiential", value: experiential },
  ];

  // -------------------------
  // Trajectory Data
  // -------------------------
  const totalTerms = config.totalTerms;

  const trajectoryData = Array.from(
    { length: totalTerms },
    (_, i) => {
      const t = i + 1;
      const expected = getExpectedByTerm(degree, t);
      const student =
        t <= termNum
          ? Math.round(totalEarned * (t / termNum))
          : null;

      return {
        term: `T${t}`,
        Expected: expected,
        Student: student,
      };
    }
  );

  // -------------------------
  // Gauge
  // -------------------------
  const gaugeData = [
    {
      value: completion,
      fill: "hsl(185, 75%, 50%)",
    },
  ];

  const riskLevel = prediction?.risk_level ?? "Medium";
  const probability = prediction?.probability ?? 0;

  const riskColor =
    riskLevel === "Low"
      ? "text-success"
      : riskLevel === "Medium"
      ? "text-warning"
      : "text-destructive";

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Academic Analytics
      </h2>

      {/* Top Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Donut */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-2">
            Credit Distribution
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trajectory */}
        <div className="glass-card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-2">
            Credit Trajectory
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trajectoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="term" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Expected"
                stroke="hsl(215, 15%, 50%)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Student"
                stroke="hsl(185, 75%, 50%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Completion Gauge */}
        <div className="glass-card p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">
            Overall Completion
          </h3>

          <div className="w-[140px] h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={180}
                endAngle={0}
                data={gaugeData}
                barSize={10}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={5}
                  background={{
                    fill: "hsl(220, 20%, 15%)",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-3xl font-bold font-mono text-primary -mt-10">
            {completion}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            of {config.totalCredits} credits
          </p>
        </div>

        {/* Risk Indicator */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">
            Risk Indicator
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle
              className={`h-8 w-8 ${riskColor}`}
            />
            <div>
              <p className={`text-lg font-bold ${riskColor}`}>
                {riskLevel} Risk
              </p>
              <p className="text-xs text-muted-foreground">
                Probability: {probability}%
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              {
                label: "Core",
                ratio:
                  credits.core /
                  (config.coreCredits || 1),
              },
              {
                label: "GE",
                ratio:
                  credits.ge /
                  FIXED_REQUIREMENTS.ge,
              },
              {
                label: "Experiential",
                ratio:
                  experiential /
                  experientialTotal,
              },
            ].map((cat, i) => (
              <div
                key={cat.label}
                className="flex items-center gap-2"
              >
                <span className="text-[10px] w-20">
                  {cat.label}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        cat.ratio * 100
                      )}%`,
                      backgroundColor: COLORS[i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Summary */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">
              Summary
            </h3>
          </div>

          <div className="space-y-2">
            {(prediction?.insights ?? [])
              .slice(0, 3)
              .map((ins, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
                >
                  <TrendingUp className="h-3 w-3 mt-0.5 text-primary" />
                  <p className="text-[11px] leading-relaxed">
                    {ins}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicAnalytics;