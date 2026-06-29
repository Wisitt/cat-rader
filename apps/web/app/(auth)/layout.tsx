"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, Home, LockKeyhole, PawPrint, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";

function Brand({ tagline }: { tagline: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
        <PawPrint className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xl font-bold tracking-tight text-text-strong">PetRadar</span>
        <span className="block truncate text-xs font-semibold text-text-muted">{tagline}</span>
      </span>
    </span>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="min-h-dvh bg-[#fbfaf7] lg:grid lg:grid-cols-2">
      <aside className="sticky top-0 hidden h-dvh overflow-hidden lg:block">
        <Image
          src="/landing/hero-care.jpg"
          alt="A pet owner caring for her dog"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[#0b2c2b]/45" />
        <Link href="/" className="absolute left-8 top-8 rounded-2xl bg-white p-3 shadow-card" aria-label="PetRadar home">
          <Brand tagline={t("brand.tagline")} />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
          <p className="max-w-lg text-3xl font-bold leading-tight xl:text-4xl">
            {t("auth.visualTitle")}
          </p>
          <div className="mt-7 grid max-w-xl gap-4 border-t border-white/35 pt-6 sm:grid-cols-3">
            {[
              [LockKeyhole, t("auth.privateLocations")],
              [ShieldCheck, t("auth.trustedProfiles")],
              [HeartHandshake, t("auth.communitySupport")],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof LockKeyhole;
              return (
                <span key={label as string} className="flex items-center gap-2 text-xs font-bold text-white">
                  <ItemIcon className="h-4 w-4" /> {label as string}
                </span>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-dvh min-w-0 flex-col overflow-x-hidden">
        <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between sm:inset-x-8">
          <Link
            href="/"
            title={t("common.home")}
            aria-label={t("common.home")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-text-muted shadow-soft transition hover:bg-background hover:text-primary lg:hidden"
          >
            <Home className="h-4 w-4" />
          </Link>
          <span className="hidden lg:block" />
          <LanguageSwitcher variant="dropdown" />
        </div>

        <div className="flex flex-1 items-start justify-center px-0 pb-6 pt-20 sm:px-8 sm:pb-8 [@media(min-height:820px)]:sm:items-center [@media(min-height:820px)]:sm:pb-10 [@media(min-height:820px)]:sm:pt-10">
          {children}
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/70 px-4 py-5 text-[11px] font-semibold text-text-muted sm:border-t-0 sm:pb-6 sm:pt-0">
          <Link href="/privacy" className="hover:text-primary">{t("common.privacy")}</Link>
          <Link href="/safety" className="hover:text-primary">{t("common.safety")}</Link>
          <Link href="/help" className="hover:text-primary">{t("common.help")}</Link>
        </footer>
      </main>
    </div>
  );
}
