import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CreditInputs } from "@/lib/academic-rules";
import type { BackendPrediction } from "@/lib/api";

interface AppState {
  degree: string;
  setDegree: (d: string) => void;

  term: string;
  setTerm: (t: string) => void;

  model: string;
  setModel: (m: string) => void;

  credits: CreditInputs;
  setCredits: (c: CreditInputs) => void;

  // NEW: Prediction State
  prediction: BackendPrediction | null;
  setPrediction: (p: BackendPrediction | null) => void;
}

const defaultCredits: CreditInputs = {
  core: 52,
  ge: 20,
  humanities: 5,
  pep: 6,
  sip: 3,
  shortIIP: 2,
  longIIP: 6,
  ee: 2,
  ri: 1,
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {

  const [degree, setDegree] = useState("BTECH");
  const [term, setTerm] = useState("Term 5");
  const [model, setModel] = useState("xgboost");
  const [credits, setCredits] = useState<CreditInputs>(defaultCredits);

  // NEW: prediction state
  const [prediction, setPrediction] = useState<BackendPrediction | null>(null);

  return (
    <AppContext.Provider
      value={{
        degree,
        setDegree,
        term,
        setTerm,
        model,
        setModel,
        credits,
        setCredits,
        prediction,
        setPrediction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be inside AppProvider");
  return ctx;
}