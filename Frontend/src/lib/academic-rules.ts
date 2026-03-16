// --------------------------------------------------
// Academic Rule Engine — Degree & Credit Logic
// --------------------------------------------------

export interface DegreeConfig {
  name: string;
  totalCredits: number;
  coreCredits: number;
  years: number;
  totalTerms: number;
}

export const NON_CORE_TOTAL = 64;

export const FIXED_REQUIREMENTS = {
  ge: 32,
  humanities: 8,
  longIIP: 10,
  shortIIP: 2,
  sip: 3,
  ee: 3,
  ri: 2,
  pep: 12,
} as const;


// --------------------------------------------------
// Degree Configurations
// --------------------------------------------------

export const DEGREE_OPTIONS: Record<string, DegreeConfig> = {
  BTECH: {
    name: "B.Tech",
    totalCredits: 160,
    coreCredits: 160 - NON_CORE_TOTAL,
    years: 4,
    totalTerms: 16,
  },
  TSM: {
    name: "TSM",
    totalCredits: 160,
    coreCredits: 160 - NON_CORE_TOTAL,
    years: 4,
    totalTerms: 16,
  },
  BBA_LLB: {
    name: "BBA + LLB",
    totalCredits: 200,
    coreCredits: 200 - NON_CORE_TOTAL,
    years: 5,
    totalTerms: 20,
  },
  BBA: {
    name: "BBA",
    totalCredits: 120,
    coreCredits: 120 - NON_CORE_TOTAL,
    years: 3,
    totalTerms: 12,
  },
  MBA: {
    name: "MBA",
    totalCredits: 80,
    coreCredits: 80 - NON_CORE_TOTAL,
    years: 2,
    totalTerms: 8,
  },
  KEDGE: {
    name: "Kedge",
    totalCredits: 80,
    coreCredits: 80 - NON_CORE_TOTAL,
    years: 2,
    totalTerms: 8,
  },
};


// --------------------------------------------------
// Term Helpers
// --------------------------------------------------

export function getTermsForDegree(degreeKey: string): string[] {
  const config = DEGREE_OPTIONS[degreeKey];
  if (!config) return [];

  return Array.from(
    { length: config.totalTerms },
    (_, i) => `Term ${i + 1}`
  );
}


// --------------------------------------------------
// AI MODELS (Fallback for UI compatibility)
// Used by TopNav + older components
// Backend will still override with /model-info
// --------------------------------------------------

export const AI_MODELS = [
  { id: "logistic", name: "Logistic Regression" },
  { id: "extra_trees", name: "Extra Trees" },
  { id: "xgboost", name: "XGBoost" },
];


// --------------------------------------------------
// Backend Model Interfaces
// --------------------------------------------------

export interface BackendModelMetrics {
  accuracy: number;
  precision: number;
  recall?: number;
  recall_delayed?: number;
  f1: number;
}

export interface BackendModelInfo {
  version: string;
  selected_model: string;
  dataset_size: number;
  metrics: Record<string, BackendModelMetrics>;
}


// --------------------------------------------------
// Convert backend models into UI models
// (Logistic + Top 2 automatically)
// --------------------------------------------------

export function getDashboardModels(modelInfo: BackendModelInfo) {

  if (!modelInfo?.metrics) return [];

  return Object.keys(modelInfo.metrics).map((id) => ({
    id,
    name: id
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
}


// --------------------------------------------------
// Credit Interfaces
// --------------------------------------------------

export interface CreditInputs {
  core: number;
  ge: number;
  humanities: number;
  pep: number;
  sip: number;
  shortIIP: number;
  longIIP: number;
  ee: number;
  ri: number;
}

export interface CreditCategory {
  key: keyof CreditInputs;
  label: string;
  required: number;
  earned: number;
  status: "completed" | "pending" | "locked";
}


// --------------------------------------------------
// Credit Category Breakdown
// --------------------------------------------------

export function getCreditCategories(
  degree: string,
  credits: CreditInputs
): CreditCategory[] {

  const config = DEGREE_OPTIONS[degree];
  if (!config) return [];

  const categories: CreditCategory[] = [
    {
      key: "core",
      label: "Core",
      required: config.coreCredits,
      earned: credits.core,
      status: "pending",
    },
    {
      key: "ge",
      label: "General Education",
      required: FIXED_REQUIREMENTS.ge,
      earned: credits.ge,
      status: "pending",
    },
    {
      key: "humanities",
      label: "Humanities (GE)",
      required: FIXED_REQUIREMENTS.humanities,
      earned: credits.humanities,
      status: "pending",
    },
    {
      key: "pep",
      label: "PEP",
      required: FIXED_REQUIREMENTS.pep,
      earned: credits.pep,
      status: "pending",
    },
    {
      key: "longIIP",
      label: "Long IIP",
      required: FIXED_REQUIREMENTS.longIIP,
      earned: credits.longIIP,
      status: "pending",
    },
    {
      key: "shortIIP",
      label: "Short IIP",
      required: FIXED_REQUIREMENTS.shortIIP,
      earned: credits.shortIIP,
      status: "pending",
    },
    {
      key: "sip",
      label: "SIP",
      required: FIXED_REQUIREMENTS.sip,
      earned: credits.sip,
      status: "pending",
    },
    {
      key: "ee",
      label: "Effective Execution",
      required: FIXED_REQUIREMENTS.ee,
      earned: credits.ee,
      status: "pending",
    },
    {
      key: "ri",
      label: "RI",
      required: FIXED_REQUIREMENTS.ri,
      earned: credits.ri,
      status: "pending",
    },
  ];

  return categories.map((c) => ({
    ...c,
    status:
      c.earned >= c.required
        ? "completed"
        : c.earned > 0
        ? "pending"
        : "locked",
  }));
}


// --------------------------------------------------
// Calculations
// --------------------------------------------------

export function getTotalEarned(credits: CreditInputs): number {
  return Object.values(credits).reduce((a, b) => a + b, 0);
}

export function getExpectedByTerm(
  degree: string,
  termNum: number
): number {

  const config = DEGREE_OPTIONS[degree];
  if (!config) return 0;

  return Math.round(
    (config.totalCredits / config.totalTerms) * termNum
  );
}

export function getCompletionPct(
  degree: string,
  credits: CreditInputs
): number {

  const config = DEGREE_OPTIONS[degree];
  if (!config) return 0;

  return Math.min(
    100,
    Math.round(
      (getTotalEarned(credits) / config.totalCredits) * 100
    )
  );
}