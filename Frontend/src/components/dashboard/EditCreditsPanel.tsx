import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import {
  DEGREE_OPTIONS,
  FIXED_REQUIREMENTS,
  getTotalEarned,
  getExpectedByTerm,
} from "@/lib/academic-rules";
import { predictStudent, mapModelName } from "@/lib/api";
import { X, Play, BookOpen } from "lucide-react";

interface EditCreditsPanelProps {
  open: boolean;
  onClose: () => void;
}

interface FieldConfig {
  key: string;
  label: string;
  max: number;
}

export function EditCreditsPanel({ open, onClose }: EditCreditsPanelProps) {

  const { degree, term, model, credits, setCredits, setPrediction } = useAppState();
  const config = DEGREE_OPTIONS[degree];

  const [draft, setDraft] = useState({
    core: credits.core,
    humanities: credits.humanities,
    otherGE: credits.ge - credits.humanities,
    pep: credits.pep,
    sip: credits.sip,
    shortIIP: credits.shortIIP,
    longIIP: credits.longIIP,
    ee: credits.ee,
    ri: credits.ri,
  });

  const [loading, setLoading] = useState(false);

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const handleChange = (key: string, raw: string) => {

    const parsed = parseInt(raw) || 0;

    const maxMap: Record<string, number> = {
      core: config?.coreCredits ?? 200,
      humanities: FIXED_REQUIREMENTS.humanities,
      otherGE: FIXED_REQUIREMENTS.ge - FIXED_REQUIREMENTS.humanities,
      pep: FIXED_REQUIREMENTS.pep,
      sip: FIXED_REQUIREMENTS.sip,
      shortIIP: FIXED_REQUIREMENTS.shortIIP,
      longIIP: FIXED_REQUIREMENTS.longIIP,
      ee: FIXED_REQUIREMENTS.ee,
      ri: FIXED_REQUIREMENTS.ri,
    };

    setDraft((prev) => ({
      ...prev,
      [key]: clamp(parsed, 0, maxMap[key] ?? 999),
    }));
  };

  const geTotal = draft.humanities + draft.otherGE;

  //--------------------------------------------------
  // RUN EVALUATION
  //--------------------------------------------------

  const handleRunEvaluation = async () => {

    setLoading(true);

    const newCredits = {
      core: draft.core,
      ge: geTotal,
      humanities: draft.humanities,
      pep: draft.pep,
      sip: draft.sip,
      shortIIP: draft.shortIIP,
      longIIP: draft.longIIP,
      ee: draft.ee,
      ri: draft.ri,
    };

    setCredits(newCredits);

    try {

      const termNum = parseInt(term.replace("Term ", "")) || 4;

      const earned = getTotalEarned(newCredits);
      const expected = getExpectedByTerm(degree, termNum);

      const deviation = earned - expected;

      const totalCredits =
        DEGREE_OPTIONS[degree]?.totalCredits ?? 160;

      const completionPct = earned / totalCredits;

      const result = await predictStudent({

        model: mapModelName(model),

        term: termNum,

        failed_courses: 0,

        attendance_rate: completionPct,
        stress_level: 0,
        extracurricular_score: 0,

        internship_completed: newCredits.longIIP ? 1 : 0,

        family_income_level: 2,
        part_time_job: 0,
        scholarship: 0,
        campus_resident: 1,

        deviation: deviation,

        // ------------------------------
        // NEW FIELDS FOR BACKEND RULE AI
        // ------------------------------

        degree: degree,
        credits_earned: earned,
        ge_credits: newCredits.ge,
        humanities_credits: newCredits.humanities,
        pep_credits: newCredits.pep,
        sip_credits: newCredits.sip,
        short_iip_credits: newCredits.shortIIP,
        long_iip_credits: newCredits.longIIP,
        ri_credits: newCredits.ri

      });

      setPrediction(result);

    } catch (err) {

      console.error("Prediction failed:", err);

    }

    setLoading(false);
    onClose();
  };

  //--------------------------------------------------

  const fields: FieldConfig[] = [
    { key: "core", label: "Core Credits", max: config?.coreCredits ?? 200 },
    { key: "humanities", label: "Humanities Credits", max: FIXED_REQUIREMENTS.humanities },
    { key: "otherGE", label: "Other GE Credits", max: FIXED_REQUIREMENTS.ge - FIXED_REQUIREMENTS.humanities },
    { key: "pep", label: "PEP", max: FIXED_REQUIREMENTS.pep },
    { key: "sip", label: "SIP", max: FIXED_REQUIREMENTS.sip },
    { key: "shortIIP", label: "Short IIP", max: FIXED_REQUIREMENTS.shortIIP },
    { key: "longIIP", label: "Long IIP", max: FIXED_REQUIREMENTS.longIIP },
    { key: "ee", label: "EE", max: FIXED_REQUIREMENTS.ee },
    { key: "ri", label: "RI", max: FIXED_REQUIREMENTS.ri },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-[380px] border-l border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Edit Academic Credits
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-65px)]">

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">

            <div className="rounded-md bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="text-foreground font-medium">
                {config?.name}
              </span>{" "}
              — {config?.totalCredits} total credits, {config?.coreCredits} core
            </div>

            {fields.map((f) => {

              const val = draft[f.key as keyof typeof draft];
              const pct = Math.min(100, Math.round((val / f.max) * 100));

              return (
                <div key={f.key} className="space-y-1">

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-card-foreground">
                      {f.label}
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      max {f.max}
                    </span>
                  </div>

                  <input
                    type="number"
                    min={0}
                    max={f.max}
                    value={val}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    className="w-full rounded-md border border-border/50 bg-secondary px-3 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                  />

                  <div className="h-1 rounded-full bg-muted overflow-hidden">

                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          pct >= 100
                            ? "hsl(155, 70%, 45%)"
                            : "hsl(185, 75%, 50%)",
                      }}
                    />

                  </div>

                </div>
              );
            })}

            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">

              <div className="flex items-center justify-between">

                <span className="text-xs font-medium text-foreground">
                  GE Total (auto-calculated)
                </span>

                <span className="text-sm font-bold font-mono text-primary">
                  {geTotal} / {FIXED_REQUIREMENTS.ge}
                </span>

              </div>

              <p className="text-[10px] text-muted-foreground mt-0.5">
                Humanities ({draft.humanities}) + Other GE ({draft.otherGE})
              </p>

            </div>

          </div>

          <div className="border-t border-border/50 px-5 py-4">

            <button
              onClick={handleRunEvaluation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >

              <Play className="h-4 w-4" />

              {loading ? "Evaluating..." : "Run Evaluation"}

            </button>

          </div>

        </div>

      </div>
    </>
  );
}