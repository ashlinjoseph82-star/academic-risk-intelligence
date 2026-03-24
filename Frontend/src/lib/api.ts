// -------------------------------------------
// Academic AI Guard - Full API Layer (FINAL STABLE)
// -------------------------------------------

const BASE_URL = "http://127.0.0.1:8000";


// -------------------------------------------
// SAFE FETCH (IMPROVED)
// -------------------------------------------

async function safeFetch(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ API Response Error:", text);
      throw new Error(text || "API request failed");
    }

    const data = await response.json();

    // Debug log (helps in development)
    console.log("✅ API Success:", url, data);

    return data;

  } catch (err: any) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      console.error("⏱ API Timeout:", url);
    } else {
      console.error("❌ API Error:", err.message || err);
    }

    throw err;
  }
}


// -------------------------------------------
// MODEL NAME MAPPING
// -------------------------------------------

export function mapModelName(uiModel: string): string {
  if (!uiModel) return "logistic";

  const modelMap: Record<string, string> = {
    "Logistic Regression": "logistic",
    "Random Forest": "random_forest",
    "Extra Trees": "extra_trees",
    "XGBoost": "xgboost",

    "logistic": "logistic",
    "random_forest": "random_forest",
    "extra_trees": "extra_trees",
    "xgboost": "xgboost",
  };

  return modelMap[uiModel] ?? uiModel.toLowerCase().replace(/\s+/g, "_");
}


// -------------------------------------------
// PREDICTION TYPES
// -------------------------------------------

export interface BackendPrediction {
  prediction: "On-Time" | "Delayed";
  probability: number;
  risk_level: "Low" | "Medium" | "High";
  model_version: string;
  model_used: string;

  pace_gap?: number;
  missing_requirements?: string[];
}


// -------------------------------------------
// PREDICT
// -------------------------------------------

export async function predictStudent(data: any): Promise<BackendPrediction> {

  const payload = {
    ...data,
    model: mapModelName(data.model),

    credits_earned: data.credits_earned ?? 0,

    ge_credits: data.ge_credits ?? 0,
    humanities_credits: data.humanities_credits ?? 0,

    pep_credits: data.pep_credits ?? 0,
    sip_credits: data.sip_credits ?? 0,
    short_iip_credits: data.short_iip_credits ?? 0,
    long_iip_credits: data.long_iip_credits ?? 0,
    ri_credits: data.ri_credits ?? 0,
  };

  return await safeFetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}


// -------------------------------------------
// BASIC ENDPOINTS
// -------------------------------------------

export async function getSummary() {
  return await safeFetch(`${BASE_URL}/summary`);
}

export async function getModelInfo() {
  return await safeFetch(`${BASE_URL}/model-info`);
}

export async function retrainModel() {
  return await safeFetch(`${BASE_URL}/retrain`, { method: "POST" });
}


// -------------------------------------------
// ANALYTICS TYPES
// -------------------------------------------

export interface CorrelationResponse {
  columns: string[];
  matrix: number[][];
}

export interface ScatterPoint {
  x: number;
  y: number;
  outcome: number;
}

export interface ScatterResponse {
  points: ScatterPoint[];
  available_cols: string[];
}

export interface SemesterProgressionRow {
  semester: number;
  avg_total: number;
  avg_expected: number;
  avg_deviation: number;
}

export interface SemesterProgressionResponse {
  data: SemesterProgressionRow[];
}


// -------------------------------------------
// ANALYTICS CALLS (SAFE + FALLBACKS)
// -------------------------------------------

export async function getCorrelation(): Promise<CorrelationResponse> {
  try {
    return await safeFetch(`${BASE_URL}/correlation`);
  } catch {
    return { columns: [], matrix: [] }; // prevents crash
  }
}

export async function getScatter(
  x: string = "attendance_rate",
  y: string = "deviation"
): Promise<ScatterResponse> {
  try {
    return await safeFetch(
      `${BASE_URL}/scatter?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`
    );
  } catch {
    return { points: [], available_cols: [] };
  }
}

export async function getSemesterProgression(): Promise<SemesterProgressionResponse> {
  try {
    return await safeFetch(`${BASE_URL}/semester-progression`);
  } catch {
    return { data: [] };
  }
}