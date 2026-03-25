import { useEffect, useState, useCallback } from "react";
import { useAppState } from "@/lib/app-state";
import {
  getTotalEarned,
  getCompletionPct,
  DEGREE_OPTIONS,
} from "@/lib/academic-rules";
import {
  getCorrelation,
  getScatter,
  type CorrelationResponse,
  type ScatterResponse,
} from "@/lib/api";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Sparkles,
  AlertTriangle,
  Brain,
  Activity,
  Grid3x3,
  RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const COLORS = [
  "hsl(185,75%,50%)",
  "hsl(255,55%,58%)",
  "hsl(155,70%,45%)",
];

const LABEL_MAP: Record<string, string> = {
  attendance_rate: "Attendance Rate",
  stress_level: "Stress Level",
  failed_courses: "Failed Courses",
  deviation: "Credit Deviation",
  extracurricular_score: "Extracurricular",
  total_credits: "Total Credits",
  family_income_level: "Family Income",
  core_credits: "Core Credits",
  semester: "Semester",
  pep_credits: "PEP Credits",
  humanities_credits: "Humanities",
  expected_credits: "Expected Credits",
  graduation_outcome: "Grad. Outcome",
};

const label = (col: string) => LABEL_MAP[col] ?? col;

// ─────────────────────────────────────────────
// Heatmap colour scale
// ─────────────────────────────────────────────

function heatColor(v: number): string {
  if (v >= 0) {
    const t = v;
    const r = Math.round(255 * (1 - t * 0.6));
    const g = Math.round(255 * (1 - t * 0.1));
    const b = Math.round(255 * (1 - t * 0.1 + t * 0.5));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    const r = 255;
    const g = Math.round(255 * (1 - t * 0.7));
    const b = Math.round(255 * (1 - t * 0.8));
    return `rgb(${r},${g},${b})`;
  }
}

// ─────────────────────────────────────────────
// Scatter Tooltip
// ─────────────────────────────────────────────

const ScatterTooltip = ({
  active,
  payload,
  xCol,
  yCol,
}: {
  active?: boolean;
  payload?: any[];
  xCol: string;
  yCol: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass-card p-2 text-xs space-y-1">
      <p>
        <span className="text-muted-foreground">{label(xCol)}:</span>{" "}
        <span className="font-mono">{d.x}</span>
      </p>
      <p>
        <span className="text-muted-foreground">{label(yCol)}:</span>{" "}
        <span className="font-mono">{d.y}</span>
      </p>
      <p className={d.outcome === 1 ? "text-destructive" : "text-success"}>
        {d.outcome === 1 ? "⚠ Delayed" : "✓ On-Time"}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Heatmap Grid (SVG)
// ─────────────────────────────────────────────

const HeatmapGrid = ({ correlation }: { correlation: CorrelationResponse }) => {
  const { columns, matrix } = correlation;
  const n = columns.length;
  const CELL = 28;
  const LABEL_W = 80;
  const LABEL_H = 72;
  const svgW = LABEL_W + n * CELL;
  const svgH = LABEL_H + n * CELL + 20;

  return (
    <svg width={svgW} height={svgH} style={{ fontFamily: "monospace", fontSize: 9 }}>
      {columns.map((col, j) => (
        <text
          key={`col-${j}`}
          x={LABEL_W + j * CELL + CELL / 2}
          y={LABEL_H - 4}
          textAnchor="start"
          transform={`rotate(-45, ${LABEL_W + j * CELL + CELL / 2}, ${LABEL_H - 4})`}
          fill="currentColor"
          opacity={0.6}
          style={{ fontSize: 8 }}
        >
          {label(col)}
        </text>
      ))}

      {columns.map((col, i) => (
        <text
          key={`row-${i}`}
          x={LABEL_W - 4}
          y={LABEL_H + i * CELL + CELL / 2 + 3}
          textAnchor="end"
          fill="currentColor"
          opacity={0.6}
          style={{ fontSize: 8 }}
        >
          {label(col)}
        </text>
      ))}

      {matrix.map((row, i) =>
        row.map((val, j) => (
          <g key={`${i}-${j}`}>
            <rect
              x={LABEL_W + j * CELL}
              y={LABEL_H + i * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill={heatColor(val)}
              rx={2}
            />
            {Math.abs(val) > 0.3 && (
              <text
                x={LABEL_W + j * CELL + CELL / 2}
                y={LABEL_H + i * CELL + CELL / 2 + 3}
                textAnchor="middle"
                style={{ fontSize: 7, fill: Math.abs(val) > 0.6 ? "#fff" : "#333" }}
              >
                {val.toFixed(2)}
              </text>
            )}
          </g>
        ))
      )}

      <defs>
        <linearGradient id="heatScale" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgb(255,80,80)" />
          <stop offset="50%" stopColor="rgb(255,255,255)" />
          <stop offset="100%" stopColor="rgb(60,200,210)" />
        </linearGradient>
      </defs>
      <rect x={LABEL_W} y={LABEL_H + n * CELL + 4}
        width={n * CELL} height={6} fill="url(#heatScale)" rx={3} />
      <text x={LABEL_W} y={svgH} style={{ fontSize: 7 }} fill="#888">-1</text>
      <text x={LABEL_W + (n * CELL) / 2} y={svgH} textAnchor="middle" style={{ fontSize: 7 }} fill="#888">0</text>
      <text x={LABEL_W + n * CELL} y={svgH} textAnchor="end" style={{ fontSize: 7 }} fill="#888">+1</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const AcademicAnalytics = () => {
  const { degree, credits, prediction } = useAppState();

  const [correlation, setCorrelation] = useState<CorrelationResponse | null>(null);
  const [scatterData, setScatterData] = useState<ScatterResponse | null>(null);

  const [xCol, setXCol] = useState("attendance_rate");
  const [yCol, setYCol] = useState("deviation");
  const [loadingCorr, setLoadingCorr] = useState(false);
  const [loadingScatter, setLoadingScatter] = useState(false);

  const config = DEGREE_OPTIONS[degree];
  const totalEarned = getTotalEarned(credits);
  const completion = getCompletionPct(degree, credits);

  // ── Correlation ─────────────────────────────
  useEffect(() => {
    setLoadingCorr(true);
    getCorrelation()
      .then(setCorrelation)
      .catch(console.error)
      .finally(() => setLoadingCorr(false));
  }, []);

  // ── Scatter ─────────────────────────────────
  const fetchScatter = useCallback(() => {
    setLoadingScatter(true);
    getScatter(xCol, yCol)
      .then(setScatterData)
      .catch(console.error)
      .finally(() => setLoadingScatter(false));
  }, [xCol, yCol]);

  useEffect(() => { fetchScatter(); }, [fetchScatter]);

  if (!config) return null;

  // ── Derived data ─────────────────────────────
  const experiential =
    credits.pep + credits.sip + credits.shortIIP +
    credits.longIIP + credits.ee + credits.ri;

  const donutData = [
    { name: "Core", value: credits.core },
    { name: "GE", value: credits.ge },
    { name: "Experiential", value: experiential },
  ];

  const gaugeData = [{ value: completion, fill: "hsl(185,75%,50%)" }];

  const riskLevel = prediction?.risk_level ?? "Medium";
  const probability = prediction?.probability ?? 0;
  const riskColor =
    riskLevel === "Low" ? "text-success" :
    riskLevel === "Medium" ? "text-warning" :
    "text-destructive";

  const onTimePoints = scatterData?.points.filter((p) => p.outcome === 0) ?? [];
  const delayedPoints = scatterData?.points.filter((p) => p.outcome === 1) ?? [];

  const availableCols = scatterData?.available_cols ?? [
    "attendance_rate", "deviation", "stress_level",
    "failed_courses", "total_credits",
  ];

  return (
    <div className="space-y-6">

      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        Academic Analytics
      </h2>

      {/* ── Scatter + Heatmap ─────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Feature Scatter
            </h3>
            {loadingScatter && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">X:</label>
              <select value={xCol} onChange={(e) => setXCol(e.target.value)}
                className="text-xs bg-background border border-border rounded px-2 py-1">
                {availableCols.map((c) => (
                  <option key={c} value={c}>{label(c)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Y:</label>
              <select value={yCol} onChange={(e) => setYCol(e.target.value)}
                className="text-xs bg-background border border-border rounded px-2 py-1">
                {availableCols.map((c) => (
                  <option key={c} value={c}>{label(c)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mb-2">
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[hsl(185,75%,50%)] inline-block" />
              On-Time
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[hsl(0,70%,55%)] inline-block" />
              Delayed
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={label(xCol)}
                label={{ value: label(xCol), position: "insideBottom", offset: -2, fontSize: 11 }} />
              <YAxis dataKey="y" name={label(yCol)}
                label={{ value: label(yCol), angle: -90, position: "insideLeft", fontSize: 11 }} />
              <ZAxis range={[20, 20]} />
              <Tooltip content={<ScatterTooltip xCol={xCol} yCol={yCol} />} />
              <Scatter name="On-Time" data={onTimePoints}
                fill="hsl(185,75%,50%)" fillOpacity={0.65} />
              <Scatter name="Delayed" data={delayedPoints}
                fill="hsl(0,70%,55%)" fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Grid3x3 className="h-4 w-4 text-primary" />
              Correlation Heatmap
            </h3>
            {loadingCorr && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>

          {correlation ? (
            <div className="overflow-auto">
              <HeatmapGrid correlation={correlation} />
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-xs">
              {loadingCorr ? "Loading heatmap…" : "No data"}
            </div>
          )}
        </div>

      </div>

      {/* ── Donut + Gauge + Risk ──────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-2">Credit Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {donutData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {donutData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full inline-block"
                  style={{ background: COLORS[i] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">Overall Completion</h3>
          <div className="w-[140px] h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="100%"
                startAngle={180} endAngle={0}
                data={gaugeData} barSize={10}>
                <RadialBar dataKey="value" cornerRadius={5}
                  background={{ fill: "hsl(220,20%,15%)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-3xl font-bold font-mono text-primary -mt-10">
            {completion}%
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalEarned} credits earned
          </p>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Indicator
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className={`h-8 w-8 ${riskColor}`} />
            <div>
              <p className={`text-lg font-bold ${riskColor}`}>{riskLevel} Risk</p>
              <p className="text-xs text-muted-foreground">Probability: {probability}%</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Delay probability</span>
              <span>{probability}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  riskLevel === "Low" ? "bg-success" :
                  riskLevel === "Medium" ? "bg-warning" : "bg-destructive"
                }`}
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
            <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {riskLevel === "Low"
                ? "Trajectory is well-aligned. Consistent engagement will maintain graduation certainty."
                : riskLevel === "Medium"
                ? "Some indicators warrant attention. Review attendance and credit deviation trends."
                : "High delay probability detected. Immediate academic intervention is recommended."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AcademicAnalytics;