import { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <SiteHeader />

      <main className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}