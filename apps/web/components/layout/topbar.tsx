"use client";
import Link from "next/link";
import { Bell, Plus, PawPrint, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { mockNotifications } from "@/lib/mock-data";
import { useI18n, type MessageKey } from "@/lib/i18n";

const PAGE_KEY_MAP: Record<string, MessageKey> = {
  "/my-petradar":      "page.petradar",
  "/map":              "page.map",
  "/sightings":        "page.sightings",
  "/lost-pets":        "page.lostPets",
  "/matches":          "page.matches",
  "/volunteer":        "page.volunteer",
  "/volunteer-profile":"page.volunteerProfile",
  "/rescue-cases":     "page.rescueCase",
  "/notifications":    "page.notifications",
  "/profile":          "page.profile",
  "/settings":         "page.settings",
  "/safety":           "page.safety",
  "/report":           "page.reportAnimal",
  "/pets":             "page.myPets",
};

export function TopBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
  const titleKey = Object.entries(PAGE_KEY_MAP).find(([key]) => pathname.startsWith(key))?.[1] ?? "page.petradar";
  const title = t(titleKey);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-white/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-soft">
          <PawPrint className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-text-strong">PetRadar</span>
      </div>
      <div className="hidden min-w-0 lg:block">
        <h1 className="text-lg font-bold text-text-strong">{title}</h1>
        <p className="text-xs text-text-muted">{t("common.findNearby")}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden w-72 xl:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            className="field h-9 pl-9"
            placeholder={t("common.searchPlaceholder")}
          />
        </label>
        <Link
          href="/report"
          className="hidden h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-dark sm:flex"
        >
          <Plus className="h-4 w-4" />
          {t("nav.report")}
        </Link>
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-text-muted shadow-inner-sm transition-colors hover:bg-background"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emergency-red text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
