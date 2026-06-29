"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, GitMerge, MapPin, X } from "lucide-react";
import { mockMatches } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MATCH_REASONS = [
  { label: "Species match", points: "+30" },
  { label: "Color match", points: "+20" },
  { label: "Location within 1 km", points: "+20" },
  { label: "Seen within 7 days", points: "+15" },
  { label: "Collar description", points: "+15" },
];

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = mockMatches.find((item) => item.id === params.id) ?? mockMatches[0];
  const [decision, setDecision] = useState<"confirmed" | "rejected" | null>(null);

  function handleConfirm() {
    setDecision("confirmed");
    window.dispatchEvent(
      new CustomEvent("petradar:toast", {
        detail: { text: "Match confirmed. The pet owner will be notified." },
      })
    );
  }

  function handleReject() {
    setDecision("rejected");
    window.dispatchEvent(
      new CustomEvent("petradar:toast", {
        detail: { text: "Match rejected. We'll keep searching for a better match." },
      })
    );
  }

  const score = match.score ?? 72;
  const confidence = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  const confidenceColor =
    score >= 70 ? "text-reunited-green" : score >= 40 ? "text-amber-600" : "text-text-muted";

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-strong"
      >
        <ArrowLeft className="h-4 w-4" /> All Matches
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">Match Review</h1>
        <StatusBadge value={match.status} />
        <span className="font-mono text-xs text-text-muted">{match.id}</span>
      </div>

      <section className="panel grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_200px_minmax(0,1fr)]">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Lost Pet</p>
          {match.lostPet.photoUrls[0] ? (
            <img
              src={match.lostPet.photoUrls[0]}
              alt=""
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mint text-sm font-bold text-text-muted">
              No photo
            </div>
          )}
          <h2 className="mt-3 text-base font-bold text-text-strong">{match.lostPet.petName}</h2>
          <p className="text-sm text-text-muted">
            {match.lostPet.color} · {match.lostPet.species}
          </p>
        </div>

        <div className="order-first flex flex-col items-center justify-center gap-3 lg:order-none">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-match-purple/20 bg-purple-50">
            <div className="text-center">
              <p className="text-3xl font-bold text-match-purple">{score}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Score</p>
            </div>
          </div>
          <div className="text-center">
            <p className={cn("text-sm font-bold", confidenceColor)}>{confidence} confidence</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="h-3 w-3" /> ~0.8 km apart
            </div>
          </div>
          <GitMerge className="h-5 w-5 text-match-purple/60" />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Sighting</p>
          {match.sighting.photoUrls[0] ? (
            <img
              src={match.sighting.photoUrls[0]}
              alt=""
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mint text-sm font-bold text-text-muted">
              No photo
            </div>
          )}
          <h2 className="mt-3 text-base font-bold text-text-strong">{match.sighting.id}</h2>
          <p className="text-sm text-text-muted">
            {match.sighting.color} · {match.sighting.species}
          </p>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-bold text-text-strong">Why they might match</h2>
        <div className="mt-3 space-y-2">
          {MATCH_REASONS.map(({ label, points }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-text-strong">
                <Check className="h-4 w-4 text-reunited-green" />
                {label}
              </div>
              <span className="text-xs font-bold text-reunited-green">{points}</span>
            </div>
          ))}
        </div>
      </section>

      {decision ? (
        <div
          className={cn(
            "rounded-2xl p-5 text-sm font-bold",
            decision === "confirmed"
              ? "border border-green-200 bg-green-50 text-reunited-green"
              : "border border-red-200 bg-red-50 text-emergency-red"
          )}
        >
          {decision === "confirmed"
            ? "Match confirmed. The pet owner has been notified."
            : "Match rejected. We'll continue searching for a better match."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4" /> Confirm This Match
          </Button>
          <Button variant="outline" onClick={handleReject}>
            <X className="h-4 w-4" /> Reject Match
          </Button>
        </div>
      )}
    </div>
  );
}
