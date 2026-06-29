"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UserRole } from "@/types";
import { authenticate, persistAuthSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { defaultRouteForRole } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (
        element: HTMLElement,
        options: {
          type: "standard";
          shape: "rectangular";
          theme: "outline";
          text: "continue_with" | "signup_with";
          size: "large";
          logo_alignment: "left";
          width: number;
          locale?: string;
        },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

interface SocialSignInProps {
  mode: "login" | "register";
  returnTo?: string;
  role?: UserRole;
  disabled?: boolean;
  onError?: (message: string) => void;
}

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function SocialSignIn({
  mode,
  returnTo,
  role,
  disabled = false,
  onError,
}: SocialSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{
    google: boolean;
    line: boolean;
    facebook: boolean;
  } | null>(null);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const { locale, t, authError } = useI18n();

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/auth/providers`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((available: { google?: boolean; line?: boolean; facebook?: boolean }) => {
        if (active) {
          setProviders({
            google: Boolean(available.google && clientId),
            line: Boolean(available.line),
            facebook: Boolean(available.facebook),
          });
        }
      })
      .catch(() => {
        if (active) setProviders({ google: false, line: false, facebook: false });
      });
    return () => { active = false; };
  }, []);

  const handleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      onError?.(t("social.googleCredentialError"));
      return;
    }

    setLoading(true);
    onError?.("");

    try {
      const result = await authenticate("google", {
        credential: response.credential,
        ...(mode === "register" && role ? { role } : {}),
      });
      persistAuthSession(result);
      setUser(result.user);
      window.dispatchEvent(new CustomEvent("petradar:toast", {
        detail: { text: t("social.googleToast") },
      }));
      router.push(returnTo || defaultRouteForRole(result.user.role));
    } catch (error) {
      onError?.(authError(error instanceof Error ? error.message : "", "social.googleUnavailable"));
    } finally {
      setLoading(false);
    }
  }, [authError, mode, onError, returnTo, role, router, setUser, t]);

  useEffect(() => {
    if (!providers?.google || !scriptReady || !clientId || !buttonRef.current || !window.google || disabled) return;

    const container = buttonRef.current;
    const render = () => {
      container.replaceChildren();
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        cancel_on_tap_outside: true,
      });
      window.google?.accounts.id.renderButton(container, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: mode === "register" ? "signup_with" : "continue_with",
        size: "large",
        logo_alignment: "left",
        width: Math.max(200, Math.min(400, Math.floor(container.clientWidth))),
        locale: locale === "zh" ? "zh_CN" : locale,
      });
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [disabled, handleCredential, locale, mode, providers?.google, scriptReady]);

  function providerHref(provider: "line" | "facebook") {
    const query = new URLSearchParams();
    if (returnTo) query.set("returnTo", returnTo);
    if (mode === "register" && role) query.set("role", role);
    return `${apiUrl}/auth/${provider}/start?${query}`;
  }

  return (
    <>
      {providers?.google ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
      ) : null}
      <div
        className={disabled ? "pointer-events-none mx-auto max-w-[400px] space-y-2 opacity-45" : "mx-auto max-w-[400px] space-y-2"}
        aria-disabled={disabled}
      >
        {providers === null ? <div className="h-11 w-full animate-pulse rounded-md bg-background" /> : null}
        {providers?.google ? <div ref={buttonRef} className="flex min-h-11 w-full items-center justify-center" /> : null}
        {providers?.line ? (
          <a
            href={providerHref("line")}
            className="flex h-12 w-full min-w-0 items-center justify-center gap-2.5 rounded-xl bg-[#06c755] px-3 text-xs font-bold text-white shadow-soft transition hover:bg-[#05b84e] min-[390px]:gap-3 min-[390px]:px-4 min-[390px]:text-sm"
          >
            <span className="flex h-6 min-w-6 items-center justify-center rounded bg-white px-1 text-[9px] font-black text-[#06c755]">LINE</span>
            <span className="min-w-0 truncate">{t("social.line")}</span>
          </a>
        ) : null}
        {providers?.facebook ? (
          <a
            href={providerHref("facebook")}
            className="flex h-12 w-full min-w-0 items-center justify-center gap-2.5 rounded-xl bg-[#1877f2] px-3 text-xs font-bold text-white shadow-soft transition hover:bg-[#1268d3] min-[390px]:gap-3 min-[390px]:px-4 min-[390px]:text-sm"
          >
            <span className="flex h-6 w-6 items-end justify-center rounded-full bg-white text-xl font-black leading-none text-[#1877f2]">f</span>
            <span className="min-w-0 truncate">{t("social.facebook")}</span>
          </a>
        ) : null}
        {providers && !providers.google && !providers.line && !providers.facebook ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-semibold text-amber-800">
            {t("social.unavailable")}
          </p>
        ) : null}
        {loading ? <p className="mt-2 text-center text-xs font-semibold text-primary">{t("social.verifyingGoogle")}</p> : null}
      </div>
    </>
  );
}
