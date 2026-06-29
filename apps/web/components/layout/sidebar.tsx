"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Heart,
  GitMerge,
  Bell,
  User,
  PawPrint,
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  const navItems = [
    { href: "/map",           labelKey: "nav.map"           as const, icon: Map },
    { href: "/report",        labelKey: "nav.report"        as const, icon: Plus },
    { href: "/lost-pets",     labelKey: "nav.lostPets"      as const, icon: Heart },
    { href: "/pets",          labelKey: "nav.myPets"        as const, icon: PawPrint },
    { href: "/matches",       labelKey: "nav.matches"       as const, icon: GitMerge },
    { href: "/volunteer",     labelKey: "nav.volunteer"     as const, icon: User },
    { href: "/notifications", labelKey: "nav.notifications" as const, icon: Bell },
    { href: "/profile",       labelKey: "nav.profile"       as const, icon: User },
  ];

  function handleLogout() {
    logout();
    window.localStorage.removeItem("petradar:user-session");
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: t("common.logoutToast") } }));
    window.location.href = "/login";
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border/80 bg-white/88 shadow-soft backdrop-blur lg:flex">
      <Link href="/my-petradar" className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
          <PawPrint className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-text-strong">PetRadar</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-mint text-primary shadow-inner-sm"
                  : "text-text-muted hover:bg-background hover:text-text-strong"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "stroke-[2.6px]")} />
              {t(labelKey)}
              {href === "/matches" ? (
                <span className="ml-auto rounded-full bg-match-purple/10 px-1.5 py-0.5 text-[10px] font-bold text-match-purple">
                  3
                </span>
              ) : href === "/notifications" ? (
                <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">7</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/80 px-3 py-3">
        <div className="px-1 pb-2">
          <LanguageSwitcher variant="dropdown" />
        </div>
        <div className="mt-1 rounded-2xl border border-border bg-background/80 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              N
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-strong">Nicha P.</p>
              <p className="text-xs text-text-muted">{t("common.verifiedVolunteer")}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-text-muted" />
          </div>
          <button onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-text-muted hover:text-red-700">
            <LogOut className="h-3.5 w-3.5" /> {t("common.logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
