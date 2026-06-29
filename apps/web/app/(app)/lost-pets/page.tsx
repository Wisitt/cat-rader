"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, GitMerge, Heart, MapPin, Plus, Search, X } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockLostPets } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { LostPetStatus, Species } from "@/types";
import { cn } from "@/lib/utils";
import { ProtectedLink } from "@/components/auth/access-gate";

const SPECIES_CHIPS: { value: Species | ""; label: string }[] = [
  { value: "", label: "All animals" },
  { value: "CAT", label: "Cats" },
  { value: "DOG", label: "Dogs" },
];

const STATUS_CHIPS: { value: LostPetStatus | ""; label: string }[] = [
  { value: "", label: "All posts" },
  { value: "ACTIVE", label: "Still missing" },
  { value: "FOUND", label: "Found" },
];

function speciesLabel(species: Species) {
  return species.charAt(0) + species.slice(1).toLowerCase();
}

function timeAgo(date: string) {
  const h = Math.round((Date.now() - new Date(date).getTime()) / 36e5);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

export default function LostPetsPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState<Species | "">("");
  const [status, setStatus] = useState<LostPetStatus | "">("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockLostPets.filter((pet) => {
      if (species && pet.species !== species) return false;
      if (status && pet.status !== status) return false;
      if (!q) return true;
      return [
        pet.petName,
        pet.species,
        pet.color,
        pet.pattern ?? "",
        pet.location.district ?? "",
        pet.description,
      ].join(" ").toLowerCase().includes(q);
    });
  }, [search, species, status]);

  const hasFilter = Boolean(search || species || status);
  const activeCount = mockLostPets.filter((pet) => pet.status === "ACTIVE").length;

  return (
    <div className="page-shell max-w-7xl space-y-6">
      <section className="rounded-3xl border border-border bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-primary">
              <Heart className="h-3.5 w-3.5" />
              Lost pet listings
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-strong">Lost Pets</h1>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Browse community reports and review possible matches. Photos, locations, and timing are grouped to make each listing easy to scan.
            </p>
          </div>
          <ProtectedLink
            href="/lost-pets/new"
            reason="Log in to create a lost pet post and receive possible match alerts."
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white shadow-soft transition hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Post Lost Pet
          </ProtectedLink>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, color, breed, area..."
              className="field h-12 rounded-2xl pl-11 pr-11 text-sm font-semibold"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-text-muted hover:bg-background hover:text-text-strong"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>

          <div className="flex flex-wrap gap-2">
            {SPECIES_CHIPS.map(({ value, label }) => (
              <button
                key={value || "all-species"}
                type="button"
                onClick={() => setSpecies(value)}
                className={cn(
                  "chip h-10 rounded-full px-3.5",
                  species === value && "border-primary bg-primary text-white hover:text-white"
                )}
              >
                <AnimalIcon species={value || "OTHER"} className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
            {STATUS_CHIPS.map(({ value, label }) => (
              <button
                key={value || "all-status"}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "chip h-10 rounded-full px-3.5",
                  status === value && "border-primary bg-primary text-white hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
            {hasFilter ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSpecies("");
                  setStatus("");
                }}
                className="chip h-10 rounded-full border-dashed px-3.5 text-emergency-red"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-text-muted">
          {filtered.length} listing{filtered.length === 1 ? "" : "s"} shown
          {hasFilter ? " for your filters" : ` · ${activeCount} still missing`}
        </p>
        <ProtectedLink href="/matches" reason="Log in to review matches connected to your lost pet posts." className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <GitMerge className="h-4 w-4" />
          View possible matches
        </ProtectedLink>
      </div>

      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((pet) => (
            <article
              key={pet.id}
              className="group overflow-hidden rounded-3xl border border-border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <Link href={`/lost-pets/${pet.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-background">
                  {pet.photoUrls[0] ? (
                    <img
                      src={pet.photoUrls[0]}
                      alt={pet.petName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-mint text-primary">
                      <AnimalIcon species={pet.species} className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusBadge value={pet.status} />
                  </div>
                  {pet.matchCount ? (
                    <div className="absolute right-3 top-3 rounded-full border border-purple-100 bg-white/95 px-3 py-1 text-xs font-black text-match-purple shadow-soft">
                      {pet.matchCount} possible match{pet.matchCount === 1 ? "" : "es"}
                    </div>
                  ) : null}
                </div>
              </Link>

              <div className="space-y-4 p-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/lost-pets/${pet.id}`} className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-text-strong group-hover:text-primary">{pet.petName}</h2>
                    </Link>
                    <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-[11px] font-bold text-text-muted">
                      {pet.id}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-muted">
                    {speciesLabel(pet.species)} · {pet.color}{pet.pattern ? ` · ${pet.pattern}` : ""}
                  </p>
                </div>

                <div className="grid gap-2 text-sm text-text-muted sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-2xl bg-background/70 px-3 py-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{pet.location.district ?? "Bangkok"}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-background/70 px-3 py-2">
                    <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{timeAgo(pet.lastSeenAt)}</span>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm leading-6 text-text-muted">{pet.description}</p>

                <div className="flex gap-2 border-t border-border pt-4">
                  <Link
                    href={`/lost-pets/${pet.id}`}
                    className="flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary-dark"
                  >
                    View details
                  </Link>
                  {pet.matchCount ? (
                    <ProtectedLink
                      href="/matches"
                      reason="Log in to review matches connected to your lost pet posts."
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 text-sm font-bold text-match-purple transition hover:bg-purple-100"
                    >
                      <GitMerge className="h-4 w-4" />
                      Matches
                    </ProtectedLink>
                  ) : (
                    <Link
                      href="/map"
                      className="flex h-10 items-center justify-center rounded-xl border border-border bg-white px-3 text-sm font-bold text-primary transition hover:bg-mint"
                    >
                      Map
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No lost pets found"
          description="Try a broader search or clear your filters."
          action={
            <ProtectedLink
              href="/lost-pets/new"
              reason="Log in to create a lost pet post and receive possible match alerts."
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Post Lost Pet
            </ProtectedLink>
          }
        />
      )}
    </div>
  );
}
