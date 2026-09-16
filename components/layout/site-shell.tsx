import { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a
        href="#main-content"
        className="skip-link focus-ring"
      >
        انتقل إلى المحتوى
      </a>

      <SiteHeader />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
