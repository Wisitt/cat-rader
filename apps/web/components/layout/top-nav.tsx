"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  LogIn,
  LogOut,
  PawPrint,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";
import { buttonVariants } from "@/components/ui/button";
import { desktopNavigation, isNavigationActive } from "@/lib/navigation";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

// Map English nav labels to i18n keys (fallback stays on English label)
const NAV_LABEL_KEYS: Record<string, MessageKey> = {
  "Map":           "nav.map",
  "Lost Pets":     "nav.lostPets",
  "My Pets":       "nav.myPets",
  "Matches":       "nav.matches",
  "Volunteer":     "nav.volunteer",
  "Nearby Cases":  "nav.nearbyCases",
  "My Cases":      "nav.myCases",
  "Nearby":        "nav.nearby",
  "Explore Map":   "nav.exploreMap",
  "How It Works":  "nav.howItWorks",
  "Pet Passport":  "nav.petPassport",
  "Safety":        "nav.safety",
  "Help Center":   "nav.helpCenter",
};

export function TopNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { t } = useI18n();
  const unread = mockNotifications.filter((item) => !item.isRead).length;
  const displayName = user?.displayName ?? "Community member";
  const initial = displayName.charAt(0);
  const navigation = desktopNavigation(user?.role, hasHydrated && isAuthenticated);
  const showReportAction = isAuthenticated && pathname !== "/map" && pathname !== "/report";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function closeOnPointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleLogout() {
    logout();
    window.localStorage.removeItem("petradar:user-role");
    window.localStorage.removeItem("petradar:access-token");
    window.localStorage.removeItem("petradar:refresh-token");
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: t("common.logoutToast") } }));
    window.location.href = "/map";
  }

  function navLabel(label: string): string {
    const key = NAV_LABEL_KEYS[label];
    return key ? t(key) : label;
  }

  return (
    <header className="sticky top-0 z-[1000] flex h-[72px] shrink-0 items-center border-b border-border bg-white px-4 shadow-soft xl:h-20 xl:px-8">
      <Link href={hasHydrated && isAuthenticated ? "/map" : "/"} className="mr-5 flex shrink-0 items-center gap-3 xl:mr-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
          <PawPrint className="h-5 w-5" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-xl font-bold tracking-tight text-text-strong">PetRadar</span>
          <span className="block text-xs font-semibold text-text-muted">
            {hasHydrated && isAuthenticated ? t("brand.yourPetCommunity") : t("brand.tagline")}
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-1 xl:flex" aria-label="PetRadar navigation">
        {navigation.map(({ href, label, badge }) => {
          const active = isNavigationActive(pathname, href);
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                active ? "bg-mint text-primary" : "text-text-muted hover:bg-background hover:text-text-strong",
              )}
            >
              {navLabel(label)}
              {badge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-match-purple/15 px-1 text-[10px] font-bold text-match-purple">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="relative z-[1001] flex items-center gap-2">
        <LanguageSwitcher variant="dropdown" />

        {hasHydrated && showReportAction ? (
          <Link
            href="/report"
            className="hidden h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-soft transition-colors hover:bg-primary-dark xl:flex"
          >
            <Plus className="h-4 w-4" />
            {t("common.reportAnimal")}
          </Link>
        ) : null}

        {!hasHydrated || !isAuthenticated ? (
          <>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
              <LogIn className="h-4 w-4" /> {t("nav.login")}
            </Link>
            <Link href="/register" className={buttonVariants()}>{t("nav.signup")}</Link>
          </>
        ) : null}

        {hasHydrated && isAuthenticated ? (
          <>
            <Link
              href="/notifications"
              aria-label={t("nav.notifications")}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-text-muted transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emergency-red text-[10px] font-bold text-white">{unread}</span>
              )}
            </Link>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-label={t("nav.profile")}
                aria-expanded={profileOpen}
                aria-controls="profile-menu"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-border bg-white p-1.5 pr-2 text-text-strong transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full bg-mint object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{initial}</span>
                )}
                <span className="hidden max-w-28 truncate text-xs font-bold text-text-muted sm:block">{displayName}</span>
                <ChevronDown className={cn("hidden h-4 w-4 text-text-muted transition-transform sm:block", profileOpen && "rotate-180")} />
              </button>

              {profileOpen ? (
                <div id="profile-menu" className="absolute right-0 top-14 z-[1100] w-60 rounded-2xl border border-border bg-white p-2 shadow-elevated">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-bold text-text-strong">{displayName}</p>
                    <p className="mt-0.5 text-xs capitalize text-text-muted">{user?.role.replace(/_/g, " ").toLowerCase()}</p>
                  </div>
                  <nav className="mt-2" aria-label="Profile menu">
                    <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-muted hover:bg-background hover:text-text-strong">
                      <CircleUserRound className="h-4 w-4" /> {t("nav.profile")}
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-muted hover:bg-background hover:text-text-strong">
                      <Bell className="h-4 w-4" /> {t("nav.notifications")}
                      {unread > 0 ? <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-emergency-red">{unread}</span> : null}
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-muted hover:bg-background hover:text-text-strong">
                      <Settings className="h-4 w-4" /> {t("nav.settings")}
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-muted hover:bg-red-50 hover:text-red-700">
                      <LogOut className="h-4 w-4" /> {t("common.logout")}
                    </button>
                  </nav>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
