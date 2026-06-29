"use client";

import { Bell, Globe, Shield, Trash2, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function SettingsPage() {
  const { t } = useI18n();

  const sections = [
    {
      titleKey: "settings.account" as const,
      icon: User,
      items: [
        { labelKey: "settings.displayName" as const, value: "Nicha P." },
        { labelKey: "settings.email"       as const, value: "nicha@petradar.app" },
        { labelKey: "settings.phone"       as const, value: "082-999-0001" },
      ],
    },
    {
      titleKey: "settings.notif" as const,
      icon: Bell,
      items: [
        { labelKey: "settings.matchAlerts"     as const, value: t("settings.enabled") },
        { labelKey: "settings.rescueUpdates"   as const, value: t("settings.enabled") },
        { labelKey: "settings.nearbySightings" as const, value: t("settings.enabled") },
        { labelKey: "settings.emailDigest"     as const, value: t("settings.weekly") },
      ],
    },
    {
      titleKey: "settings.privacy" as const,
      icon: Shield,
      items: [
        { labelKey: "settings.showName"            as const, value: t("settings.yes") },
        { labelKey: "settings.locationPrecision"   as const, value: t("settings.approximate") },
        { labelKey: "settings.profileVisibility"   as const, value: t("settings.volunteersOnly") },
      ],
    },
  ];

  return (
    <div className="page-shell max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-text-muted">{t("settings.subtitle")}</p>
      </div>

      {/* Language section — prominent, at the top */}
      <section className="overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-border bg-mint/40 px-5 py-3">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-primary">{t("settings.langRegion")}</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-text-muted">{t("settings.selectLanguage")}</p>
          <LanguageSwitcher variant="inline" />
          <div className="grid gap-0 divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-strong">{t("settings.timezone")}</span>
              <span className="rounded-full bg-white border border-border px-2.5 py-1 text-xs font-bold text-text-muted">Asia/Bangkok</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-strong">{t("settings.dateFormat")}</span>
              <span className="rounded-full bg-white border border-border px-2.5 py-1 text-xs font-bold text-text-muted">DD/MM/YYYY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Other settings */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map(({ titleKey, icon: Icon, items }) => (
          <section key={titleKey} className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-background px-5 py-3">
              <Icon className="h-4 w-4 text-text-muted" />
              <h2 className="text-sm font-bold text-text-strong">{t(titleKey)}</h2>
            </div>
            <div className="divide-y divide-border">
              {items.map(({ labelKey, value }) => (
                <div key={labelKey} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-text-strong">{t(labelKey)}</span>
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-bold text-text-muted">{value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-emergency-red">
          <Trash2 className="h-4 w-4" /> {t("settings.dangerZone")}
        </h2>
        <p className="text-xs text-text-muted">{t("settings.deleteWarning")}</p>
        <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-emergency-red hover:bg-red-100 transition-colors">
          {t("settings.deleteAccount")}
        </button>
      </div>
    </div>
  );
}
