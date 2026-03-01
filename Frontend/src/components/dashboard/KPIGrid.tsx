import { useAppState } from "@/lib/app-state";
import {
  getTotalEarned,
  getExpectedByTerm,
  DEGREE_OPTIONS,
  FIXED_REQUIREMENTS,
} from "@/lib/academic-rules";
import { TrendingUp, Target, Clock, Lock, Cpu, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { getSummary, getModelInfo } from "@/lib/api";

export function KPIGrid() {
  const { degree, term, credits } = useAppState();
  const config = DEGREE_OPTIONS[degree];
  const termNum = parseInt(term.replace("Term ", "")) || 4;

  // -----------------------------
  // Academic Calculations (Frontend Logic)
  // -----------------------------
  const totalEarned = getTotalEarned(credits);
  const expected = getExpectedByTerm(degree, termNum);
  const pending = config ? config.totalCredits - totalEarned : 0;
  const futureLocked = Math.max(0, pending - 20);
  const coreProgress = config
    ? Math.round((credits.core / config.coreCredits) * 100)
    : 0;
  const geProgress = Math.round(
    (credits.ge / FIXED_REQUIREMENTS.ge) * 100
  );

  // -----------------------------
  // Backend State (ML + DB)
  // -----------------------------
  const [summary, setSummary] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const summaryData = await getSummary();
        const modelData = await getModelInfo();

        setSummary(summaryData);
        setModelInfo(modelData);
      } catch (error) {
        console.error("Backend connection failed:", error);
      }
    }

    loadBackendData();
  }, []);

  // -----------------------------
  // Academic KPIs
  // -----------------------------
  const academicKpis = [
    {
      icon: TrendingUp,
      label: "Total Earned",
      value: totalEarned,
      max: config?.totalCredits ?? 160,
      color: "text-primary",
    },
    {
      icon: Target,
      label: "Expected by Now",
      value: expected,
      max: config?.totalCredits ?? 160,
      color: "text-info",
    },
    {
      icon: Clock,
      label: "Pending Credits",
      value: pending,
      max: config?.totalCredits ?? 160,
      color: "text-warning",
    },
    {
      icon: Lock,
      label: "Future Locked",
      value: futureLocked,
      max: config?.totalCredits ?? 160,
      color: "text-muted-foreground",
    },
    {
      icon: Cpu,
      label: "Core Progress",
      value: coreProgress,
      max: 100,
      color: "text-accent",
      suffix: "%",
    },
    {
      icon: BookOpen,
      label: "GE Progress",
      value: geProgress,
      max: 100,
      color: "text-success",
      suffix: "%",
    },
  ];

  // -----------------------------
  // Backend KPIs
  // -----------------------------
  const systemKpis = summary
    ? [
        {
          icon: Cpu,
          label: "Total Students",
          value: summary.total_students,
          max: summary.total_students,
          color: "text-info",
        },
        {
          icon: TrendingUp,
          label: "Delayed %",
          value: summary.delayed_percentage,
          max: 100,
          color: "text-warning",
          suffix: "%",
        },
        {
          icon: Target,
          label: "On-Time %",
          value: summary.on_time_percentage,
          max: 100,
          color: "text-success",
          suffix: "%",
        },
        {
          icon: Cpu,
          label: "Model Version",
          value: modelInfo?.version ?? "v1",
          max: 1,
          color: "text-accent",
        },
      ]
    : [];

  const allKpis = [...academicKpis, ...systemKpis];

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {allKpis.map((kpi) => (
        <div key={kpi.label} className="glass-card p-3.5 hover-lift">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </span>
          </div>

          <p className={`text-xl font-bold font-mono ${kpi.color}`}>
            {kpi.value}
            {kpi.suffix ?? ""}
          </p>

          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 progress-glow"
              style={{
                width: `${Math.min(
                  100,
                  kpi.suffix === "%"
                    ? kpi.value
                    : (kpi.value / kpi.max) * 100
                )}%`,
                background:
                  kpi.color === "text-primary"
                    ? "hsl(185, 75%, 50%)"
                    : kpi.color === "text-info"
                    ? "hsl(200, 80%, 55%)"
                    : kpi.color === "text-warning"
                    ? "hsl(40, 85%, 55%)"
                    : kpi.color === "text-accent"
                    ? "hsl(255, 55%, 58%)"
                    : kpi.color === "text-success"
                    ? "hsl(155, 70%, 45%)"
                    : "hsl(215, 15%, 50%)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}