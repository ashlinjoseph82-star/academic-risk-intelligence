// -------------------------------------------
// Academic AI Guard - Full API Layer (FINAL FIXED)
// -------------------------------------------

const BASE_URL = "http://127.0.0.1:8000";

// -------------------------------------------
// TYPES
// -------------------------------------------

export interface BackendPrediction {
  prediction: "On-Time" | "Delayed";
  probability: number;
  risk_level: "Low" | "Medium" | "High";
  model_version: string;
  model_used: string;
}

export interface PredictionResponse {
  risk_level: "Low" | "Medium" | "High";
  probability: number;
  confidence: number;
  insights: string[];
}

export interface SummaryResponse {
  total_students: number;
  delayed_percentage: number;
  on_time_percentage: number;
}

export interface ModelInfoResponse {
  version: string;
  dataset_size: number;
  trained_on: string;
  models: Record<
    string,
    {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
    }
  >;
}

// -------------------------------------------
// INTERNAL FETCH HELPER
// -------------------------------------------

async function safeFetch(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    console.error("API Error:", err);
    throw err;
  }
}

// -------------------------------------------
// MODEL NAME MAPPING (NOW CORRECT)
// -------------------------------------------

function mapModelName(uiModel: string): string {
  const modelMap: Record<string, string> = {
    "Logistic Regression": "logistic",
    "Decision Tree": "decision_tree",
    "Random Forest": "random_forest",
    "Gradient Boosting": "gradient_boosting",
    "XGBoost": "xgboost",
  };

  return modelMap[uiModel] || "logistic";
}

// -------------------------------------------
// REAL BACKEND CALL
// -------------------------------------------

export async function predictStudent(data: {
  model: string;
  semester: number;
  core_credits: number;
  pep_credits: number;
  humanities_credits: number;
  internship_completed: number;
  failed_courses: number;
  total_credits: number;
  expected_credits: number;
  deviation: number;
}): Promise<BackendPrediction> {
  return await safeFetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// -------------------------------------------
// WRAPPER USED BY UI
// -------------------------------------------

export async function predictRisk(
  request: any
): Promise<PredictionResponse> {

  const termNum =
    parseInt(request.term?.replace("Term ", "")) || 4;

  const totalCredits =
    Object.values(request.credits || {}).reduce(
      (a: number, b: any) =>
        a + (typeof b === "number" ? b : 0),
      0
    );

  const expectedCredits = 20 * termNum;
  const deviation = totalCredits - expectedCredits;

  const selectedModel = mapModelName(request.model);

  const backendResult = await predictStudent({
    model: selectedModel,
    semester: termNum,
    core_credits: request.credits?.core ?? 0,
    pep_credits: request.credits?.pep ?? 0,
    humanities_credits: request.credits?.humanities ?? 0,
    internship_completed: 0,
    failed_courses: 0,
    total_credits: totalCredits,
    expected_credits: expectedCredits,
    deviation: deviation,
  });

  return {
    risk_level: backendResult.risk_level,
    probability: backendResult.probability,
    confidence: 90,
    insights: [
      `Model version ${backendResult.model_version} used.`,
      `Model selected: ${backendResult.model_used}.`,
      `Predicted outcome: ${backendResult.prediction}.`,
      `Deviation from expected credits: ${deviation}.`,
    ],
  };
}

// -------------------------------------------
// DASHBOARD ENDPOINTS
// -------------------------------------------

export async function getSummary(): Promise<SummaryResponse> {
  return await safeFetch(`${BASE_URL}/summary`);
}

export async function getModelInfo(): Promise<ModelInfoResponse> {
  return await safeFetch(`${BASE_URL}/model-info`);
}

export async function retrainModel(): Promise<{ message: string }> {
  return await safeFetch(`${BASE_URL}/retrain`, {
    method: "POST",
  });
}