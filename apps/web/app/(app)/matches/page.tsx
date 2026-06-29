"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Clock, GitMerge, Heart, MapPin, SearchX, ShieldCheck, X } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockMatches } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Match } from "@/types";
import { cn } from "@/lib/utils";

type Decision = "confirm" | "reject";
type MatchWithDecision = Match & { _decision?: Decision };

function scoreLabel(score: number) {
  if (score >= 85) return "Strong match";
  if (score >= 70) return "Likely match";
  return "Possible match";
}

function dateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MatchPhoto({
  label,
  image,
  alt,
  species,
  align = "left",
}: {
  label: string;
  image?: string;
  alt: string;
  species: Match["lostPet"]["species"];
  align?: "left" | "right";
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-background">
      {image ? (
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center bg-mint text-primary">
          <AnimalIcon species={species} className="h-14 w-14" />
        </div>
      )}
      <div className={cn("absolute top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-text-muted shadow-soft", align === "left" ? "left-3" : "right-3")}>
        {label}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onDecide,
}: {
  match: MatchWithDecision;
  onDecide: (id: string, decision: Decision) => void;
}) {
  const score = match.score ?? 72;
  const reasons = [
    "Same species",
    `Similar color: ${match.lostPet.color}`,
    `${match.distanceKm} km from last seen area`,
    "Reported recently",
  ];

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
        <div className="p-4 sm:p-5">
          <MatchPhoto
            label="Lost pet"
            image={match.lostPet.photoUrls[0]}
            alt={match.lostPet.petName}
            species={match.lostPet.species}
          />
          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-text-strong">{match.lostPet.petName}</h2>
                <p className="mt-1 text-sm font-semibold text-text-muted">
                  {match.lostPet.species.toLowerCase()} · {match.lostPet.color}
                </p>
              </div>
              <StatusBadge value={match.lostPet.status} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="h-4 w-4 text-primary" />
              {match.lostPet.location.district ?? "Bangkok"}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-y border-border bg-background/55 p-5 lg:border-x lg:border-y-0">
          <div className="text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-purple-100 bg-white shadow-soft">
              <div>
                <p className="text-3xl font-black leading-none text-match-purple">{score}%</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-match-purple/65">match score</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-black text-text-strong">{scoreLabel(score)}</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">Review the photos and details before taking action.</p>
          </div>

          <div className="mt-5 space-y-2">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-text-muted shadow-inner-sm">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-reunited-green" />
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <MatchPhoto
            label="New sighting"
            image={match.sighting.photoUrls[0]}
            alt={match.sighting.id}
            species={match.sighting.species}
            align="right"
          />
          <div className="mt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-text-strong">{match.sighting.id}</h3>
                <p className="mt-1 text-sm font-semibold text-text-muted">
                  {match.sighting.species.toLowerCase()} · {match.sighting.color}
                </p>
              </div>
              <StatusBadge value={match.sighting.status} />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-text-muted sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl bg-background/70 px-3 py-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{match.sighting.location.district ?? "Bangkok"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-background/70 px-3 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{dateLabel(match.sighting.seenAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-5">
        {match._decision ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold",
              match._decision === "confirm"
                ? "bg-green-50 text-reunited-green"
                : "bg-red-50 text-emergency-red"
            )}
          >
            {match._decision === "confirm" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {match._decision === "confirm"
              ? "Confirmed. A follow-up notification has been sent."
              : "Dismissed. We will keep watching for better matches."}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onDecide(match.id, "confirm")}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-white shadow-soft transition hover:bg-primary-dark"
            >
              <Check className="h-4 w-4" />
              This is my pet
            </button>
            <button
              type="button"
              onClick={() => onDecide(match.id, "reject")}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-text-muted transition hover:border-emergency-red/30 hover:bg-red-50 hover:text-emergency-red"
            >
              <X className="h-4 w-4" />
              Not mine
            </button>
            <Link
              href={`/matches/${match.id}`}
              className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-primary transition hover:bg-mint"
            >
              <GitMerge className="h-4 w-4" />
              Full review
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithDecision[]>(
    mockMatches.map((match) => ({ ...match }))
  );

  const pending = matches.filter((match) => match.status === "PENDING" && !match._decision);
  const reviewed = matches.filter((match) => match.status !== "PENDING" || match._decision);

  function decide(id: string, decision: Decision) {
    setMatches((current) =>
      current.map((match) => (match.id === id ? { ...match, _decision: decision } : match))
    );
    window.dispatchEvent(new CustomEvent("petradar:toast", {
      detail: {
        text: decision === "confirm"
          ? "Match confirmed. We will help with next steps."
          : "Match dismissed. We will keep looking.",
      },
    }));
  }

  return (
    <div className="page-shell max-w-6xl space-y-6">
      <section className="rounded-3xl border border-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-match-purple">
              <GitMerge className="h-3.5 w-3.5" />
              Match review
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-strong">Possible Matches</h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Compare your lost pet with recent sightings. Confirm only when the photo and details feel right.
            </p>
          </div>
          <Link
            href="/lost-pets"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-primary shadow-inner-sm transition hover:bg-mint"
          >
            <Heart className="h-4 w-4" />
            Lost pet listings
          </Link>
        </div>
      </section>

      {pending.length ? (
        <div className="space-y-5">
          {pending.map((match) => (
            <MatchCard key={match.id} match={match} onDecide={decide} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No pending matches"
          description="We will notify you when a new possible match appears."
        />
      )}

      {reviewed.length ? (
        <section className="rounded-3xl border border-border bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-strong">Reviewed matches</h2>
            <span className="text-xs font-bold text-text-muted">{reviewed.length} reviewed</span>
          </div>
          <div className="space-y-2">
            {reviewed.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3 transition hover:bg-mint/45"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    match._decision === "confirm" || match.status === "CONFIRMED"
                      ? "bg-green-50 text-reunited-green"
                      : "bg-red-50 text-emergency-red"
                  )}
                >
                  {match._decision === "confirm" || match.status === "CONFIRMED" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-strong">
                    {match.lostPet.petName} and {match.sighting.id}
                  </p>
                  <p className="text-xs text-text-muted">{match.score}% score · {match.distanceKm} km away</p>
                </div>
                <span className="text-xs font-bold text-primary">Review</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
