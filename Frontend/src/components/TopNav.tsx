import { useAppState } from "@/lib/app-state";
import { DEGREE_OPTIONS, getTermsForDegree, AI_MODELS } from "@/lib/academic-rules";
import { User, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect } from "react";

export function TopNav() {
  const { degree, setDegree, term, setTerm, model, setModel } = useAppState();

  const terms = getTermsForDegree(degree);

  useEffect(() => {
    if (!terms.includes(term)) {
      setTerm(terms[Math.min(4, terms.length - 1)] ?? terms[0] ?? "Term 1");
    }
  }, [degree, terms, term, setTerm]);

  const selectClass =
    "appearance-none bg-secondary border border-border/50 text-foreground text-xs rounded-md px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer";

  return (
    <header className="fixed top-0 left-[220px] right-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-6">

      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-foreground">
          Academic Risk Intelligence
        </h1>

        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">
          v2.0
        </span>
      </div>

      <div className="flex items-center gap-3">

        {/* Degree */}
        <div className="relative">
          <select
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className={selectClass}
          >
            {Object.entries(DEGREE_OPTIONS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.name}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>

        {/* Term */}
        <div className="relative">
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={selectClass}
          >
            {terms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>

        {/* Model */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={selectClass}
          >
            {AI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User */}
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-border/50">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>

      </div>
    </header>
  );
}