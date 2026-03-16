// -------------------------------------------
// Academic AI Guard - Full API Layer (STABLE)
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

  pace_gap?: number;
  missing_requirements?: string[];
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
}


// -------------------------------------------
// SAFE FETCH
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
      throw new Error(text || "API request failed");

    }

    return await response.json();

  } catch (err: any) {

    clearTimeout(timeout);

    if (err.name === "AbortError") {
      console.error("API Timeout:", url);
    } else {
      console.error("API Error:", err);
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
    "Extra Trees": "extra_trees",
    "XGBoost": "xgboost",

    "logistic": "logistic",
    "extra_trees": "extra_trees",
    "xgboost": "xgboost",

  };

  return modelMap[uiModel] ?? uiModel.toLowerCase().replace(/\s+/g, "_");
}


// -------------------------------------------
// MAIN BACKEND PREDICTION CALL
// -------------------------------------------

export interface PredictStudentRequest {

  model: string;
  term: number;

  failed_courses: number;

  attendance_rate: number;
  stress_level: number;
  extracurricular_score: number;

  internship_completed: number;
  family_income_level: number;
  part_time_job: number;
  scholarship: number;
  campus_resident: number;

  deviation: number;

  degree?: string;
  credits_earned?: number;

  ge_credits?: number;
  humanities_credits?: number;

  pep_credits?: number;
  sip_credits?: number;
  short_iip_credits?: number;
  long_iip_credits?: number;
  ri_credits?: number;
}

export async function predictStudent(
  data: PredictStudentRequest
): Promise<BackendPrediction> {

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
// OPTIONAL DASHBOARD WRAPPER
// -------------------------------------------

export async function predictRisk(
  request: {
    model: string;
    term: string;
    attendance_rate: number;
    deviation: number;
    internship_completed: number;
  }
): Promise<PredictionResponse> {

  const termNum =
    Number(request.term?.replace("Term ", "")) || 1;

  const backendResult = await predictStudent({

    model: request.model,
    term: termNum,

    failed_courses: 0,

    attendance_rate: request.attendance_rate,
    stress_level: 0,
    extracurricular_score: 0,

    internship_completed: request.internship_completed,
    family_income_level: 2,
    part_time_job: 0,
    scholarship: 0,
    campus_resident: 1,

    deviation: request.deviation,

    credits_earned: 0

  });

  const insights: string[] = [

    `Model version ${backendResult.model_version} used.`,
    `Model selected: ${backendResult.model_used}.`,
    `Predicted outcome: ${backendResult.prediction}.`,

  ];

  if (backendResult.pace_gap !== undefined) {

    if (backendResult.pace_gap > 0) {
      insights.push(`Student is ${backendResult.pace_gap} credits behind expected pace.`);
    } else if (backendResult.pace_gap < 0) {
      insights.push(`Student is ahead of academic pace.`);
    }

  }

  if (backendResult.missing_requirements?.length) {

    insights.push(
      `Missing requirements: ${backendResult.missing_requirements.join(", ")}`
    );

  }

  const probability = Math.max(0, Math.min(100, backendResult.probability));

  return {

    risk_level: backendResult.risk_level,
    probability,
    confidence: 100 - probability,
    insights,

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