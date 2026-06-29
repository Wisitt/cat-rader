"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, Clock, GitMerge, Heart, MapPin, PawPrint, Plus, ShieldCheck } from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockLostPets, mockSightings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";

const actions = [
  {
    href: "/report",
    title: "Report Animal",
    description: "Seen an animal who may need help? Send a report with photos and location.",
    icon: Plus,
    primary: true,
  },
  {
    href: "/lost-pets/new",
    title: "Post Lost Pet",
    description: "Create a lost pet listing so neighbors and volunteers can look for a match.",
    icon: Heart,
  },
  {
    href: "/map",
    title: "Search Map",
    description: "Check nearby reports and possible sightings around your area.",
    icon: MapPin,
  },
  {
    href: "/matches",
    title: "View Matches",
    description: "Review possible matches between lost pets and recent sightings.",
    icon: GitMerge,
  },
];

interface StoredReport {
  id?: string;
  species?: string;
  color?: string;
  description?: string;
  district?: string;
  photos?: string[];
  createdAt?: string;
}

function timeAgo(date: string) {
  const hours = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 36e5));
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function MyPetRadarPage() {
  const nearby = mockSightings.slice(0, 3);
  const pet = mockLostPets[0];
  const [myReports, setMyReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("petradar:sightings") ?? "[]");
      if (Array.isArray(stored)) setMyReports(stored.slice(0, 4));
    } catch {
      setMyReports([]);
    }
  }, []);

  return (
    <div className="page-shell space-y-5">
      {/* Hero action section */}
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-bold text-primary">
              <PawPrint className="h-3.5 w-3.5" />
              Community animal help
            </div>
            <h1 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-text-strong sm:text-4xl">
              What do you need to do right now?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
              PetRadar helps you report an animal, search nearby sightings, and follow up on lost pet matches.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/report" className={buttonVariants({ size: "lg" })}>
                <Plus className="h-4 w-4" />
                Report Animal
              </Link>
              <Link href="/map" className={buttonVariants({ variant: "outline", size: "lg" })}>
                <MapPin className="h-4 w-4" />
                Search Map
              </Link>
            </div>
          </div>
          <div className="border-t border-border bg-gradient-to-br from-mint/80 to-[#EEF5F2] p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">Your latest case</p>
                  <h2 className="mt-1 text-lg font-bold text-text-strong">{pet?.petName ?? "Milo"}</h2>
                  <p className="text-sm text-text-muted">Possible matches are ready to review.</p>
                </div>
                <StatusBadge value="PENDING" />
              </div>
              <Link href="/matches" className={buttonVariants({ className: "mt-4 w-full" })}>
                View Matches
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick action cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ href, title, description, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div
              className={
                primary
                  ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white"
                  : "flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-primary"
              }
            >
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-text-strong">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-text-muted">{description}</p>
          </Link>
        ))}
      </section>

      {/* Your recent reports (from localStorage) */}
      {myReports.length > 0 && (
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-text-strong">Your Recent Reports</h2>
              <p className="text-xs text-text-muted">Reports you submitted in this session</p>
            </div>
            <Link href="/map" className="text-xs font-bold text-primary">View on map</Link>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {myReports.map((r, i) => (
              <div key={r.id ?? i} className="rounded-2xl border border-border bg-background/40 p-3">
                {r.photos?.[0] ? (
                  <img src={r.photos[0]} alt="" className="h-28 w-full rounded-xl object-cover" />
                ) : (
                  <div className="grid h-28 place-items-center rounded-xl bg-mint text-primary">
                    <AnimalIcon species={r.species ?? "OTHER"} className="h-10 w-10" />
                  </div>
                )}
                <p className="mt-3 truncate text-sm font-bold text-text-strong">
                  {r.color ?? "Unknown"} {(r.species ?? "animal").toLowerCase()}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="h-3 w-3" />
                  {r.createdAt ? timeAgo(r.createdAt) : "Just now"}
                  {r.district ? ` · ${r.district}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby now + sidebar */}
      <section className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-text-strong">Nearby Now</h2>
            <Link href="/map" className="text-xs font-bold text-primary">Open map</Link>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {nearby.map((s) => (
              <Link href={`/sightings/${s.id}`} key={s.id} className="rounded-2xl border border-border bg-background/40 p-3">
                {s.photoUrls[0] ? (
                  <img src={s.photoUrls[0]} alt="" className="h-28 w-full rounded-xl object-cover" />
                ) : (
                  <div className="grid h-28 place-items-center rounded-xl bg-mint text-primary">
                    <PawPrint className="h-7 w-7" />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-text-strong">
                    {s.color} {s.species.toLowerCase()}
                  </p>
                  <StatusBadge value={s.status} />
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {s.location.district ?? "Bangkok"} ·{" "}
                  {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-strong">Need to update a case?</h2>
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  Add a new note, photo, or status update so helpers know what changed.
                </p>
              </div>
            </div>
            <Link href="/profile" className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}>
              Update My Case
            </Link>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p>
                <strong>Safety first.</strong> Exact locations stay protected. Public viewers only see approximate areas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
