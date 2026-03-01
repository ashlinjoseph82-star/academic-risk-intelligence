import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Brain, Activity } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Academic Analytics" },
  { to: "/models", icon: Brain, label: "Model Intelligence" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-border/50 bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 glow-border">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">ARIP</p>
          <p className="text-[10px] text-muted-foreground">Risk Intelligence</p>
        </div>
      </div>

      <div className="neon-line mx-4" />

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary glow-border font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="mt-auto px-4 pb-5">
        <div className="neon-line mb-3" />
        <div className="glass-card p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">System Status</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success">All Models Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
