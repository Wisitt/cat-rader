"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate, persistAuthSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { defaultRouteForRole, roleForIntent, safeReturnTo } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const oauthError = Array.isArray(searchParams?.oauthError) ? searchParams.oauthError[0] : searchParams?.oauthError;
  const reason = Array.isArray(searchParams?.reason) ? searchParams.reason[0] : searchParams?.reason;
  const returnTo = safeReturnTo(searchParams?.returnTo, "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError ?? "");
  const { locale, t, authError } = useI18n();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authenticate("login", { email: email.trim(), password });
      persistAuthSession(result);
      setUser(result.user);
      window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: t("login.toast") } }));
      router.push(returnTo || defaultRouteForRole(result.user.role));
    } catch (reason) {
      setError(authError(reason instanceof Error ? reason.message : "", "login.error"));
    } finally {
      setLoading(false);
    }
  }

  const registerHref = returnTo
    ? `/register?${new URLSearchParams({ returnTo, ...(reason ? { reason } : {}) }).toString()}`
    : "/register";

  return (
    <div className="w-full max-w-[480px]">
      <section className="border-y border-[#e8e2d8] bg-white px-4 py-6 shadow-none min-[390px]:px-5 sm:rounded-3xl sm:border sm:p-8 sm:shadow-card">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" /> {t("login.badge")}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-strong sm:mt-5 sm:text-3xl">{t("login.title")}</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">{t("login.subtitle")}</p>
        </div>

        {reason ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-teal-200 bg-mint/60 p-3.5 text-sm leading-6 text-primary sm:mt-5 sm:p-4">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
            <div><p className="font-bold">{t("login.reason")}</p><p className="mt-0.5 text-primary/80">{locale === "en" ? reason : t("login.reasonBody")}</p></div>
          </div>
        ) : null}

        <div className="mt-5 sm:mt-6">
          <SocialSignIn mode="login" returnTo={returnTo} role={roleForIntent(returnTo)} onError={setError} />
        </div>

        <div className="my-5 flex items-center gap-2.5 text-center text-[10px] font-bold uppercase leading-4 text-text-muted sm:my-6 sm:gap-3">
          <span className="h-px flex-1 bg-border" /> {t("login.divider")} <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold text-text-strong">{t("login.email")}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("login.emailPlaceholder")} className="h-12 pl-10" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="text-xs font-bold text-text-strong">{t("login.password")}</label>
              <Link href="/help?topic=account" className="shrink-0 text-xs font-bold text-primary hover:text-primary-dark">{t("login.needHelp")}</Link>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("login.passwordPlaceholder")} className="h-12 px-10" minLength={8} required />
              <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted hover:bg-background hover:text-text-strong">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="h-12 w-full text-base">
            {loading ? t("login.signingIn") : t("login.signIn")} {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm leading-6 text-text-muted sm:mt-6">
          {t("login.new")} <Link href={registerHref} className="font-bold text-primary hover:text-primary-dark">{t("login.create")}</Link>
        </p>
      </section>

      <p className="px-4 py-4 text-center text-xs text-text-muted sm:mt-4 sm:p-0">
        {t("login.looking")} <Link href="/map" className="font-bold text-primary hover:text-primary-dark">{t("login.explore")}</Link>
      </p>
    </div>
  );
}
