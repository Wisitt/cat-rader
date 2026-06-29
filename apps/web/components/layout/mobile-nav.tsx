"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { loginHref } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";
import { isNavigationActive, mobileNavigation } from "@/lib/navigation";
import { useI18n, type MessageKey } from "@/lib/i18n";

// Map href to i18n key so labels translate when locale changes
const HREF_KEYS: Record<string, MessageKey> = {
  "/map":              "nav.map",
  "/lost-pets":        "nav.lostPets",
  "/report":           "nav.report",
  "/pets":             "nav.myPets",
  "/matches":          "nav.matches",
  "/volunteer":        "nav.nearbyCases",
  "/volunteer-profile":"nav.myCases",
  "/notifications":    "nav.notifications",
  "/profile":          "nav.profile",
  "/safety":           "nav.safety",
  "/help":             "nav.helpCenter",
};

// Map the English "Log in" label to key
const LABEL_KEYS: Record<string, MessageKey> = {
  "Log in": "nav.login",
  "Nearby": "nav.nearby",
};

export function MobileNav() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { t } = useI18n();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex overflow-hidden border-t border-border bg-white px-1.5 pb-2 pt-1 shadow-elevated xl:hidden" aria-label="Mobile navigation">
      {mobileNavigation(role, isAuthenticated).map(({ href, label, icon: Icon, primary, loginReason }) => {
        const active = isNavigationActive(pathname, href);
        const target = loginReason && !isAuthenticated ? loginHref(href, loginReason) : href;
        const translatedLabel = HREF_KEYS[href]
          ? t(HREF_KEYS[href])
          : LABEL_KEYS[label]
            ? t(LABEL_KEYS[label])
            : label;

        return (
          <Link
            key={href}
            href={hasHydrated ? target : pathname}
            aria-disabled={!hasHydrated}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-bold transition-colors",
              primary && "-mt-5",
              active && !primary ? "text-primary" : "text-text-muted",
            )}
          >
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
              active && !primary && "bg-mint",
              primary ? "h-12 w-12 rounded-full bg-primary text-white shadow-elevated" : "text-current",
            )}>
              <Icon className={cn("h-5 w-5", active && !primary && "stroke-[2.5px]")} />
            </span>
            <span className="max-w-full truncate leading-none">{translatedLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
