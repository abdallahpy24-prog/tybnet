import { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />

      <main className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}