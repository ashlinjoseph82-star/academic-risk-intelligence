import { useState } from "react";
import { ExecutivePanel } from "@/components/dashboard/ExecutivePanel";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { CreditBreakdown } from "@/components/dashboard/CreditBreakdown";
import { EditCreditsPanel } from "@/components/dashboard/EditCreditsPanel";
import { SlidersHorizontal } from "lucide-react";

const Dashboard = () => {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div /> {/* spacer */}
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/30"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Edit Academic Credits
        </button>
      </div>
      <ExecutivePanel />
      <KPIGrid />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <AIInsights />
        <CreditBreakdown />
      </div>
      <EditCreditsPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
};

export default Dashboard;
