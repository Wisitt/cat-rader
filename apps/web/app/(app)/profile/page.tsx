"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Edit2,
  Heart,
  LogOut,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimalIcon } from "@/components/icons/pets";
import { mockUser, mockSightings, mockLostPets } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

type PrefKey = "emailNotifications" | "dailyDigest" | "urgentAlerts" | "allowMessages";
const NOTIFICATION_PREFS: { key: PrefKey; label: string; desc: string }[] = [
  { key: "emailNotifications", label: "Email notifications",  desc: "Get updates via email" },
  { key: "dailyDigest",        label: "Daily digest",         desc: "Summary of nearby activity" },
  { key: "urgentAlerts",       label: "Urgent alerts",        desc: "Emergency cases near you" },
  { key: "allowMessages",      label: "Allow volunteer messages", desc: "Let volunteers contact you" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-border"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-inner-sm transition-transform",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default function ProfilePage() {
  const sessionUser = useAuthStore((state) => state.user);
  const u = sessionUser ?? mockUser;
  const logout = useAuthStore((s) => s.logout);
  const myReports  = mockSightings.slice(0, 3);
  const myPets     = mockLostPets.slice(0, 2);

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    emailNotifications: true,
    dailyDigest: true,
    urgentAlerts: true,
    allowMessages: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(u.displayName);

  function togglePref(key: PrefKey) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Preferences saved." } }));
  }

  function handleLogout() {
    logout();
    window.localStorage.removeItem("petradar:user-role");
    window.location.href = "/map";
  }

  function saveProfile() {
    setEditMode(false);
    window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "Profile saved." } }));
  }

  return (
    <div className="page-shell max-w-4xl space-y-6">

      {/* Profile card */}
      <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
        {/* Teal gradient banner */}
        <div className="h-24 bg-gradient-to-br from-primary to-primary-deep" />

        <div className="px-5 pb-5">
          {/* Avatar overlapping banner */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary text-3xl font-black text-white shadow-card">
              {u.displayName.charAt(0)}
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button onClick={saveProfile} className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white">
                    <CheckCircle2 className="h-4 w-4" /> Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border text-text-muted">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-text-muted shadow-inner-sm hover:border-primary/30 hover:text-primary">
                  <Edit2 className="h-4 w-4" /> Edit profile
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          {editMode ? (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="field mb-1 text-2xl font-bold"
            />
          ) : (
            <h1 className="text-2xl font-bold text-text-strong">{displayName}</h1>
          )}

          {/* Tags */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-mint px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified volunteer
            </span>
            <span className="text-sm text-text-muted">
              Member since {new Date(u.createdAt).getFullYear()}
            </span>
          </div>

          {/* Bio */}
          {u.bio && <p className="mt-3 text-sm leading-6 text-text-muted">{u.bio}</p>}

          {/* Contact info */}
          <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
            {u.email ? (
              <div className="flex items-center gap-2.5 text-sm text-text-muted">
                <Mail className="h-4 w-4 shrink-0" />{u.email}
              </div>
            ) : null}
            {u.phone && (
              <div className="flex items-center gap-2.5 text-sm text-text-muted">
                <Phone className="h-4 w-4 shrink-0" />{u.phone}
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-text-muted">
              <Shield className="h-4 w-4 shrink-0" />{u.role.replace(/_/g, " ")}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-text-muted">
              <Calendar className="h-4 w-4 shrink-0" />
              Joined {new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
      </section>

      {/* My reports + My pets (two columns) */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* My Reports */}
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-text-strong">My Reports</h2>
            </div>
            <Link href="/sightings" className="text-xs font-bold text-primary">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {myReports.map((s) => (
              <Link
                key={s.id}
                href={`/sightings/${s.id}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-background/50"
              >
                {s.photoUrls[0] ? (
                  <img src={s.photoUrls[0]} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint text-primary">
                    <AnimalIcon species={s.species} className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-strong">
                    {s.color} {s.species.toLowerCase()}
                  </p>
                  <p className="text-xs text-text-muted">
                    {s.location.district ?? "Bangkok"} · {new Date(s.seenAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <StatusBadge value={s.status} />
              </Link>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <Link
              href="/report"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 text-sm font-semibold text-primary hover:bg-mint/40"
            >
              + New report
            </Link>
          </div>
        </section>

        {/* My Lost Pets */}
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-match-purple" />
              <h2 className="text-sm font-bold text-text-strong">My Lost Pets</h2>
            </div>
            <Link href="/lost-pets" className="text-xs font-bold text-primary">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {myPets.map((pet) => (
              <Link
                key={pet.id}
                href={`/lost-pets/${pet.id}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-background/50"
              >
                {pet.photoUrls[0] ? (
                  <img src={pet.photoUrls[0]} alt={pet.petName} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint text-primary">
                    <AnimalIcon species={pet.species} className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-text-strong">{pet.petName}</p>
                  <p className="text-xs text-text-muted">
                    <MapPin className="mr-0.5 inline-block h-3 w-3" />
                    {pet.location.district ?? "Bangkok"}
                  </p>
                </div>
                {pet.matchCount && pet.matchCount > 0 ? (
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-match-purple">
                    {pet.matchCount} match{pet.matchCount !== 1 ? "es" : ""}
                  </span>
                ) : (
                  <StatusBadge value={pet.status} />
                )}
              </Link>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <Link
              href="/lost-pets/new"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-match-purple/30 text-sm font-semibold text-match-purple hover:bg-purple-50/40"
            >
              + Post lost pet
            </Link>
          </div>
        </section>
      </div>

      {/* Notification preferences */}
      <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Bell className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-bold text-text-strong">Notification Preferences</h2>
        </div>
        <div className="divide-y divide-border">
          {NOTIFICATION_PREFS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-text-strong">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
              <Toggle on={prefs[key]} onToggle={() => togglePref(key)} />
            </div>
          ))}
        </div>
      </section>

      {/* Privacy + volunteer info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-teal-200 bg-mint/40 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold text-primary">Your privacy is protected</p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                Exact locations are never shared publicly. Only verified volunteers and admins can access precise coordinates with audit trails.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-reunited-green" />
            <div>
              <p className="text-sm font-bold text-green-800">Verified volunteer</p>
              <p className="mt-1 text-xs leading-5 text-green-700">
                You can access assigned rescue cases and submit field updates.{" "}
                <Link href="/volunteer" className="font-bold underline">View my cases →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold text-text-muted shadow-inner-sm transition-colors hover:border-emergency-red/30 hover:text-emergency-red"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}
