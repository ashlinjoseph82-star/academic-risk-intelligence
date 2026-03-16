import { useEffect, useState } from "react";
import { getModelInfo, getSummary } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from "recharts";
import { Trophy, Brain, Database, Activity } from "lucide-react";

type ModelMetrics = {
  version: string;
  selected_model: string;
  dataset_size: number;
  metrics: Record<
    string,
    {
      accuracy: number;
      precision: number;
      recall?: number;
      recall_delayed?: number;
      f1: number;
    }
  >;
};

/* Dashboard Color Palette */

const CHART_COLORS = {
  accuracy: "#10B981",
  precision: "#3B82F6",
  recall: "#F59E0B",
  f1: "#8B5CF6",
  scatter: "#6366F1",
  onTime: "#22C55E",
  delayed: "#EF4444"
};

export default function ModelIntelligence() {

  const [modelData, setModelData] = useState<ModelMetrics | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {

    async function loadData() {

      const m = await getModelInfo();
      const s = await getSummary();

      setModelData(m);
      setSummary(s);

    }

    loadData();

  }, []);

  if (!modelData) {
    return <div className="glass-card p-4">Loading model intelligence...</div>;
  }

  const models = modelData.metrics;

  const rankedModels = Object.entries(models)
    .filter(([name]) => name !== "logistic")
    .sort(
      (a, b) =>
        (b[1].recall_delayed ?? b[1].recall ?? 0) -
        (a[1].recall_delayed ?? a[1].recall ?? 0)
    )
    .slice(0, 2);

  const comparisonModels = [
    ...(models["logistic"] ? [["logistic", models["logistic"]] as any] : []),
    ...rankedModels
  ];

  const comparisonData = comparisonModels.map(([name, m]) => ({
    model: name.replace(/_/g, " ").toUpperCase(),
    accuracy: m.accuracy * 100,
    precision: m.precision * 100,
    recall: (m.recall_delayed ?? m.recall ?? 0) * 100,
    f1: m.f1 * 100,
  }));

  const bestModel = rankedModels.length > 0 ? rankedModels[0][0] : "logistic";

  const avgAccuracy =
    comparisonData.reduce((a, b) => a + b.accuracy, 0) /
    comparisonData.length;

  const avgRecall =
    comparisonData.reduce((a, b) => a + b.recall, 0) /
    comparisonData.length;

  const outcomeData = summary
    ? [
        { name: "On-Time", value: summary.on_time_percentage },
        { name: "Delayed", value: summary.delayed_percentage },
      ]
    : [];

  return (

    <div className="space-y-6">

      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        Model Intelligence Dashboard
      </h2>

      {/* KPI CARDS */}

      <div className="grid grid-cols-4 gap-5">

        <div className="glass-card p-4 flex items-center gap-3">
          <Trophy className="text-yellow-400"/>
          <div>
            <p className="text-xs text-muted-foreground">Best Model</p>
            <p className="font-semibold">
              {bestModel.replace(/_/g," ").toUpperCase()}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <Database/>
          <div>
            <p className="text-xs text-muted-foreground">Dataset Size</p>
            <p className="font-semibold">{modelData.dataset_size}</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <Activity/>
          <div>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="font-semibold">{avgAccuracy.toFixed(2)}%</p>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <Activity/>
          <div>
            <p className="text-xs text-muted-foreground">Avg Recall</p>
            <p className="font-semibold">{avgRecall.toFixed(2)}%</p>
          </div>
        </div>

      </div>

      {/* DASHBOARD GRID */}

      <div className="grid grid-cols-2 gap-6">

        {/* MODEL PERFORMANCE */}

        <div className="glass-card p-4">

          <h3 className="text-sm font-semibold mb-3">
            Model Performance
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="model"/>
              <YAxis domain={[0,100]}/>
              <Tooltip/>
              <Legend/>

              <Bar dataKey="accuracy" fill={CHART_COLORS.accuracy}/>
              <Bar dataKey="precision" fill={CHART_COLORS.precision}/>
              <Bar dataKey="recall" fill={CHART_COLORS.recall}/>
              <Bar dataKey="f1" fill={CHART_COLORS.f1}/>

            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* DATASET DISTRIBUTION */}

        <div className="glass-card p-4">

          <h3 className="text-sm font-semibold mb-3">
            Dataset Distribution
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>

              <Pie
                data={outcomeData}
                dataKey="value"
                outerRadius={90}
                innerRadius={40}
              >
                {outcomeData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? "#14B8A6" : "#F43F5E"}
                  />
                ))}
              </Pie>

              <Tooltip/>
              <Legend/>

            </PieChart>
          </ResponsiveContainer>

        </div>

        {/* PRECISION VS RECALL */}

        <div className="glass-card p-4">

          <h3 className="text-sm font-semibold mb-3">
            Precision vs Recall
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>

              <CartesianGrid/>

              <XAxis dataKey="precision"/>
              <YAxis dataKey="recall"/>

              <Tooltip/>

              <Scatter
                data={comparisonData}
                fill={CHART_COLORS.scatter}
              />

            </ScatterChart>
          </ResponsiveContainer>

        </div>

        {/* ACCURACY TREND */}

        <div className="glass-card p-4">

          <h3 className="text-sm font-semibold mb-3">
            Accuracy Trend
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={comparisonData}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="model"/>
              <YAxis domain={[0,100]}/>

              <Tooltip/>

              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={CHART_COLORS.accuracy}
                strokeWidth={3}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>

  );
}