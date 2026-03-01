import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <TopNav />
      <main className="ml-[220px] mt-14 p-5 scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
