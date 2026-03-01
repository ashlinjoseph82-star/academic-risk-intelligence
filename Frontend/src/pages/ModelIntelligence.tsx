import { useEffect, useState } from "react";
import { useAppState } from "@/lib/app-state";
import { getModelInfo } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Trophy, CheckCircle2, Info } from "lucide-react";

type ModelMetrics = {
  version: string;
  selected_model: string;
  dataset_size: number;
  metrics: Record<
    string,
    {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
    }
  >;
};

const METRICS = ["accuracy", "precision", "recall"] as const;
type Metric = typeof METRICS[number];

const ModelIntelligence = () => {
  const { model: selectedModel } = useAppState();
  const [modelData, setModelData] = useState<ModelMetrics | null>(null);
  const [activeMetric, setActiveMetric] = useState<Metric>("accuracy");

  useEffect(() => {
    async function loadModelInfo() {
      try {
        const data = await getModelInfo();
        setModelData(data);
      } catch (err) {
        console.error("Failed to load model info:", err);
      }
    }

    loadModelInfo();
  }, []);

  if (!modelData) {
    return <div className="glass-card p-4">Loading model intelligence...</div>;
  }

  const modelNames = Object.keys(modelData.metrics);

  const bestModel = modelNames.reduce((a, b) =>
    modelData.metrics[b][activeMetric] >
    modelData.metrics[a][activeMetric]
      ? b
      : a
  );

  const barData = modelNames.map((m) => ({
    name: m,
    value: Math.round(modelData.metrics[m][activeMetric] * 100),
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Model Intelligence</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Model comparison table */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">
            Model Comparison (v{modelData.version})
          </h3>

          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_70px_70px_70px] gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Model</span>
              <span className="text-center">Accuracy</span>
              <span className="text-center">Precision</span>
              <span className="text-center">Recall</span>
            </div>

            {modelNames.map((m) => {
              const isBest = m === bestModel;
              const isSelected = m === selectedModel;
              const metrics = modelData.metrics[m];

              return (
                <div
                  key={m}
                  className={`grid grid-cols-[1fr_70px_70px_70px] gap-2 items-center px-2 py-2 rounded-md ${
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBest && (
                      <Trophy className="h-3 w-3 text-warning" />
                    )}
                    <span className="text-xs font-medium">
                      {m}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] text-primary">
                        Active
                      </span>
                    )}
                  </div>

                  {METRICS.map((metric) => (
                    <span
                      key={metric}
                      className="text-xs text-center font-mono"
                    >
                      {(metrics[metric] * 100).toFixed(1)}%
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar chart */}
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Performance Comparison
            </h3>

            <div className="flex gap-1">
              {METRICS.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-2 py-1 text-[10px] capitalize ${
                    activeMetric === m
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(185, 75%, 50%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deployment explanation */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <h3 className="text-sm font-semibold">
            Deployment Details
          </h3>
        </div>

        <div className="text-[11px] text-muted-foreground space-y-2">
          <p>
            Selected Model:{" "}
            <span className="text-foreground font-medium">
              {modelData.selected_model}
            </span>
          </p>

          <p>
            Dataset Size:{" "}
            <span className="text-foreground">
              {modelData.dataset_size} records
            </span>
          </p>

          <p>
            Selection Metric:{" "}
            <span className="text-foreground">
              Recall (High Risk Priority)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelIntelligence;