import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CreditInputs } from "@/lib/academic-rules";

interface AppState {
  degree: string;
  setDegree: (d: string) => void;
  term: string;
  setTerm: (t: string) => void;
  model: string;
  setModel: (m: string) => void;
  credits: CreditInputs;
  setCredits: (c: CreditInputs) => void;
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

  return (
    <AppContext.Provider value={{ degree, setDegree, term, setTerm, model, setModel, credits, setCredits }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be inside AppProvider");
  return ctx;
}
