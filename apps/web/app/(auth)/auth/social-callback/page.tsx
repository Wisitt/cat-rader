"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import type { User } from "@/types";
import { persistAuthSession } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { defaultRouteForRole, safeReturnTo } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";

interface SocialExchangeResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  returnTo: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function SocialCallbackPage() {
  const [error, setError] = useState("");
  const exchangeStarted = useRef(false);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const { t, authError } = useI18n();

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError(t("callback.incomplete"));
      return;
    }

    fetch(`${apiUrl}/auth/social/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const payload = await response.json() as SocialExchangeResult | { message?: string };
        if (!response.ok || !("user" in payload)) {
          throw new Error("message" in payload ? payload.message : t("callback.failed"));
        }
        return payload;
      })
      .then((payload) => {
        persistAuthSession(payload);
        setUser(payload.user);
        window.dispatchEvent(new CustomEvent("petradar:toast", {
          detail: { text: t("callback.toast") },
        }));
        router.replace(safeReturnTo(payload.returnTo, defaultRouteForRole(payload.user.role)));
      })
      .catch((reason) => {
        setError(authError(reason instanceof Error ? reason.message : "", "callback.failed"));
      });
  }, [authError, router, setUser, t]);

  return (
    <div className="w-full max-w-md">
      <div className="panel p-8 text-center">
        {error ? (
          <>
            <ShieldCheck className="mx-auto h-10 w-10 text-emergency-red" />
            <h1 className="mt-4 text-xl font-bold text-text-strong">{t("callback.title")}</h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">{error}</p>
            <button type="button" onClick={() => router.replace("/login")} className="mt-6 h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white">
              {t("callback.return")}
            </button>
          </>
        ) : (
          <>
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-bold text-text-strong">{t("callback.securing")}</h1>
            <p className="mt-2 text-sm text-text-muted">{t("callback.wait")}</p>
          </>
        )}
      </div>
    </div>
  );
}
