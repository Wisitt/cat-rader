"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  FileClock,
  FileText,
  Flame,
  GanttChartSquare,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  PawPrint,
  ShieldCheck,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@petradar/ui";

const sections = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/verification", label: "Verification Queue", icon: ClipboardCheck },
      { href: "/reports", label: "Reports", icon: FileText },
      { href: "/duplicates", label: "Duplicates", icon: GanttChartSquare },
      { href: "/rescue-cases", label: "Rescue Cases", icon: Flame },
    ],
  },
  {
    label: "People & Access",
    items: [
      { href: "/volunteers", label: "Volunteers", icon: ShieldCheck },
      { href: "/users", label: "Users", icon: Users },
      { href: "/roles", label: "Roles", icon: LockKeyhole },
      { href: "/privacy", label: "Privacy", icon: LockKeyhole },
    ],
  },
  {
    label: "Insights & CMS",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/content", label: "CMS Content", icon: Megaphone },
      { href: "/audit-logs", label: "Audit Logs", icon: FileClock },
      { href: "/settings", label: "Settings", icon: LockKeyhole },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState("Admin Nicha");
  const [adminRole, setAdminRole] = useState("SUPER ADMIN");

  useEffect(() => {
    setAdminUser(window.localStorage.getItem("petradar:admin-user") ?? "Admin Nicha");
    setAdminRole((window.localStorage.getItem("petradar:admin-role") ?? "SUPER_ADMIN").replace(/_/g, " "));
  }, []);

  function logout() {
    window.localStorage.removeItem("petradar:admin-role");
    window.localStorage.removeItem("petradar:admin-user");
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Logged out of admin portal." } }));
    window.location.href = "/login";
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-white/90 shadow-soft backdrop-blur lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
            <PawPrint className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-text-strong">PetRadar</p>
            <p className="text-xs font-semibold text-text-muted">Admin CMS</p>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {sections.map((section) => (
            <div key={section.label} className="mt-3">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-text-muted/70">{section.label}</p>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
                      active ? "bg-mint text-primary" : "text-text-muted hover:bg-background hover:text-text-strong"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="rounded-2xl border border-border bg-background p-3">
            <p className="truncate text-sm font-bold text-text-strong">{adminUser}</p>
            <p className="text-xs capitalize text-text-muted">{adminRole.toLowerCase()} · Exact access logged</p>
            <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-muted hover:text-red-700">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/82 px-4 backdrop-blur lg:px-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Back Office</p>
            <p className="text-xs text-text-muted">Moderation, rescue operations, analytics, and CMS</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/verification" className="chip hidden sm:inline-flex">32 pending</Link>
            <Link href="/audit-logs" className="chip hidden sm:inline-flex">Audit Logs</Link>
            <Link href="/settings" className="chip">Settings</Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
