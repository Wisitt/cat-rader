"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALES: { value: Locale; native: string; label: Record<Locale, string> }[] = [
  {
    value: "en",
    native: "EN",
    label: { en: "English", th: "English", zh: "English", ja: "English" },
  },
  {
    value: "th",
    native: "TH",
    label: { en: "ภาษาไทย", th: "ภาษาไทย", zh: "泰语", ja: "タイ語" },
  },
  {
    value: "zh",
    native: "中",
    label: { en: "中文", th: "ภาษาจีน", zh: "中文", ja: "中国語" },
  },
  {
    value: "ja",
    native: "JP",
    label: { en: "日本語", th: "ภาษาญี่ปุ่น", zh: "日语", ja: "日本語" },
  },
];

interface Props {
  /** "dropdown" = button + popover (default), "inline" = radio grid */
  variant?: "dropdown" | "inline";
  className?: string;
}

export function LanguageSwitcher({ variant = "dropdown", className }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handle);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", handle);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
        {LOCALES.map(({ value, native, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition",
              locale === value
                ? "border-primary bg-mint shadow-inner-sm"
                : "border-border bg-white hover:bg-background"
            )}
          >
            <span className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
              locale === value ? "bg-primary text-white" : "bg-background text-text-muted"
            )}>
              {native}
            </span>
            <div className="min-w-0">
              <p className={cn("truncate text-sm font-bold", locale === value ? "text-primary" : "text-text-strong")}>
                {label[locale]}
              </p>
              {locale === value && (
                <p className="text-[10px] font-bold text-primary/70">{t("settings.language")}</p>
              )}
            </div>
            {locale === value && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
          </button>
        ))}
      </div>
    );
  }

  const current = LOCALES.find((l) => l.value === locale)!;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold text-text-muted transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label={t("settings.selectLanguage")}
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-xs font-black text-text-strong">{current.native}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[1200] min-w-[160px] overflow-hidden rounded-2xl border border-border bg-white shadow-elevated">
          {LOCALES.map(({ value, native, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setLocale(value); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                locale === value
                  ? "bg-mint font-bold text-primary"
                  : "text-text-muted hover:bg-background hover:text-text-strong"
              )}
            >
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black",
                locale === value ? "bg-primary text-white" : "bg-background text-text-muted"
              )}>
                {native}
              </span>
              <span className="flex-1 truncate">{label[locale]}</span>
              {locale === value && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
