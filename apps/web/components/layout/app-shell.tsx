import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { AccessGate } from "@/components/auth/access-gate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopNav />
      <main className="min-h-0 flex-1 overflow-y-auto pb-20 xl:pb-0">
        <AccessGate>{children}</AccessGate>
      </main>
      <MobileNav />
    </div>
  );
}
