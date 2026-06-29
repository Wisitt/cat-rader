"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Heart, LockKeyhole, Mail, PawPrint, UserRound, Users } from "lucide-react";
import type { UserRole } from "@/types";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate, persistAuthSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { defaultRouteForRole, roleForIntent, safeReturnTo } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";

const ROLES: { value: UserRole; icon: React.ElementType }[] = [
  { value: "REPORTER", icon: PawPrint },
  { value: "PET_OWNER", icon: Heart },
  { value: "VOLUNTEER", icon: Users },
];

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const returnTo = safeReturnTo(searchParams?.returnTo, "");
  const reason = Array.isArray(searchParams?.reason) ? searchParams.reason[0] : searchParams?.reason;
  const [role, setRole] = useState<UserRole>(roleForIntent(returnTo) ?? "REPORTER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { locale, t, authError } = useI18n();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authenticate("register", {
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        password,
        role,
      });
      persistAuthSession(result);
      setUser(result.user);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: t("register.toast") } }));
      router.push(returnTo || defaultRouteForRole(result.user.role));
    } catch (reason) {
      setError(authError(reason instanceof Error ? reason.message : "", "register.error"));
    } finally {
      setLoading(false);
    }
  }

  const loginHref = returnTo
    ? `/login?${new URLSearchParams({ returnTo, ...(reason ? { reason } : {}) }).toString()}`
    : "/login";

  return (
    <div className="w-full max-w-[650px]">
      <section className="rounded-3xl border border-[#e8e2d8] bg-white p-5 shadow-card sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase text-primary">{t("register.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-strong">{t("register.title")}</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">{t("register.subtitle")}</p>
        </div>

        {reason ? (
          <div className="mt-5 rounded-2xl border border-teal-200 bg-mint/60 p-4 text-sm leading-6 text-primary">
            <p className="font-bold">{t("register.reason")}</p><p className="mt-0.5 text-primary/80">{locale === "en" ? reason : t("login.reasonBody")}</p>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold text-text-strong">{t("register.participate")}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {ROLES.map(({ value, icon: Icon }) => {
              const label = value === "PET_OWNER" ? t("role.owner") : value === "VOLUNTEER" ? t("role.volunteer") : t("role.reporter");
              const description = value === "PET_OWNER" ? t("role.ownerDesc") : value === "VOLUNTEER" ? t("role.volunteerDesc") : t("role.reporterDesc");
              return (
                <button key={value} type="button" onClick={() => setRole(value)} aria-pressed={role === value} className={cn("min-h-28 rounded-2xl border p-4 text-left transition", role === value ? "border-primary bg-mint/70 ring-2 ring-primary/10" : "border-border bg-white hover:border-primary/30 hover:bg-background")}>
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", role === value ? "bg-primary text-white" : "bg-background text-primary")}><Icon className="h-4 w-4" /></span>
                  <span className="mt-3 block text-sm font-bold text-text-strong">{label}</span>
                  <span className="mt-1 block text-[11px] leading-4 text-text-muted">{description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <SocialSignIn mode="register" returnTo={returnTo} role={role} onError={setError} />
        </div>

        <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase text-text-muted">
          <span className="h-px flex-1 bg-border" /> {t("register.divider")} <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="first-name" className="text-xs font-bold text-text-strong">{t("register.firstName")}</label>
              <div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><Input id="first-name" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={t("register.firstName")} className="h-12 pl-10" minLength={1} required /></div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="last-name" className="text-xs font-bold text-text-strong">{t("register.lastName")}</label>
              <Input id="last-name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={t("register.lastName")} className="h-12" minLength={1} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-email" className="text-xs font-bold text-text-strong">{t("register.email")}</label>
            <div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /><Input id="register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 pl-10" required /></div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-xs font-bold text-text-strong">{t("register.password")}</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("register.passwordPlaceholder")} className="h-12 px-10" minLength={8} required />
              <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted hover:bg-background hover:text-text-strong">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-text-muted">{t("register.passwordHint")}</p>
          </div>

          {error ? (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="h-12 w-full text-base">
            {loading ? t("register.creating") : t("register.create")} {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-5 text-text-muted">
          {t("register.termsPrefix")} <Link href="/safety" className="font-bold text-primary">{t("register.guidelines")}</Link> {t("register.and")} <Link href="/privacy" className="font-bold text-primary">{t("register.privacyPolicy")}</Link>.
        </p>
        <p className="mt-5 text-center text-sm text-text-muted">
          {t("register.existing")} <Link href={loginHref} className="font-bold text-primary hover:text-primary-dark">{t("register.signIn")}</Link>
        </p>
      </section>
    </div>
  );
}
