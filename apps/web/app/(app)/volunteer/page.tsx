"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { RescueCase } from "@/types";
import { cn } from "@/lib/utils";
import { loginHref } from "@/lib/access-control";
import { useAuthStore } from "@/store/auth-store";
import { ProtectedLink } from "@/components/auth/access-gate";

type CaseAction = "accepted" | "updated";
type VolunteerAccess = "guest" | "blocked" | "allowed";

function dateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RequestCard({
  rescueCase,
  action,
  onAction,
  access,
}: {
  rescueCase: RescueCase;
  action?: CaseAction;
  onAction: (id: string, action: CaseAction) => void;
  access: VolunteerAccess;
}) {
  const sighting = rescueCase.sighting;

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <Link href={`/rescue-cases/${rescueCase.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-background">
          {sighting.photoUrls[0] ? (
            <img src={sighting.photoUrls[0]} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-mint text-primary">
              <AnimalIcon species={sighting.species} className="h-14 w-14" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <StatusBadge value={rescueCase.priority} />
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-text-muted shadow-soft">
            {rescueCase.status.replace(/_/g, " ").toLowerCase()}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link href={`/rescue-cases/${rescueCase.id}`} className="min-w-0">
              <h2 className="truncate text-base font-bold text-text-strong">
                {sighting.color} {sighting.species.toLowerCase()}
              </h2>
            </Link>
            <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-text-muted">
              {rescueCase.id}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
            <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {sighting.location.district ?? "Bangkok"}
            </span>
            <span className="rounded-full bg-background px-2.5 py-1">{dateLabel(rescueCase.updatedAt)}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-text-muted">{rescueCase.notes}</p>

        {action ? (
          <div className={cn(
            "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold",
            action === "accepted" ? "bg-green-50 text-reunited-green" : "bg-mint text-primary"
          )}>
            <Check className="h-4 w-4" />
            {action === "accepted" ? "You accepted this request." : "Update noted for this request."}
          </div>
        ) : access === "blocked" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
            Volunteer role is required to accept or update this case.
          </div>
        ) : access === "guest" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={loginHref("/volunteer", "Log in with a volunteer account to accept cases and add updates.")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              <Check className="h-4 w-4" /> Log in to accept
            </Link>
            <Link
              href={loginHref("/volunteer", "Log in with a volunteer account to accept cases and add updates.")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold text-primary transition hover:bg-mint"
            >
              Log in to update <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAction(rescueCase.id, "accepted")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onAction(rescueCase.id, "updated")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold text-primary transition hover:bg-mint"
            >
              Update
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function VolunteerPage() {
  const nearby = mockRescueCases.slice(0, 4);
  const [actions, setActions] = useState<Record<string, CaseAction>>({});
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const access: VolunteerAccess = !isAuthenticated ? "guest" : role === "VOLUNTEER" ? "allowed" : "blocked";

  function handleAction(id: string, action: CaseAction) {
    if (!isAuthenticated) {
      router.push(loginHref("/volunteer", "Log in with a volunteer account to accept cases and add updates."));
      return;
    }
    if (role !== "VOLUNTEER") return;
    setActions((current) => ({ ...current, [id]: action }));
    window.dispatchEvent(new CustomEvent("petradar:toast", {
      detail: {
        text: action === "accepted"
          ? "Request accepted. Check the case page for next steps."
          : "Case update saved for this session.",
      },
    }));
  }

  return (
    <div className="page-shell max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_.78fr]">
          <div className="p-5 sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-primary">
              <HeartHandshake className="h-3.5 w-3.5" />
              Volunteer center
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-text-strong sm:text-4xl">
              Help nearby animals safely.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
              Choose a request, check the public details, and share a quick update. PetRadar keeps exact locations protected until help is coordinated.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/map" className={buttonVariants({ size: "lg" })}>
                <MapPin className="h-4 w-4" />
                Find Nearby Cases
              </Link>
              {isAuthenticated && role !== "VOLUNTEER" ? (
                <span className={cn(buttonVariants({ variant: "outline", size: "lg" }), "cursor-not-allowed opacity-60")}>
                  Volunteer access required
                </span>
              ) : (
                <ProtectedLink
                  href="/volunteer-profile"
                  reason="Log in with a volunteer account to view assigned cases and add updates."
                  requiredRole="VOLUNTEER"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Update My Cases
                </ProtectedLink>
              )}
            </div>
          </div>

          <div className="border-t border-border bg-background/55 p-5 lg:border-l lg:border-t-0">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: ShieldCheck, title: "Stay safe", text: "Do not approach injured or aggressive animals." },
                { icon: CheckCircle2, title: "Verify gently", text: "Photos and public details are enough for most updates." },
                { icon: Sparkles, title: "Small help matters", text: "A quick check can guide the next volunteer." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-white p-4 shadow-inner-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 text-sm font-bold text-text-strong">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-strong">Nearby requests</h2>
          <p className="mt-1 text-sm text-text-muted">Open a request or accept a small helper task.</p>
        </div>
        <Link href="/map" className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-primary shadow-inner-sm transition hover:bg-mint">
          Open map
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {nearby.map((rescueCase) => (
          <RequestCard
            key={rescueCase.id}
            rescueCase={rescueCase}
            action={actions[rescueCase.id]}
            onAction={handleAction}
            access={access}
          />
        ))}
      </section>
    </div>
  );
}
