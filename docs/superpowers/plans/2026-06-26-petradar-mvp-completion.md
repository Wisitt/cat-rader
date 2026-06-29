# PetRadar User Web App — MVP Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all user web app violations of the visual direction spec and complete missing MVP pages so every nav item, button, form, and route works end-to-end with no dead UI.

**Architecture:** Next.js 14 App Router with `(app)` route group for authenticated consumer pages. Mock data via `localStorage` for MVP persistence. Auth via `useAuthStore` (Zustand). Toast feedback via `petradar:toast` custom DOM events. Phase 1 removes admin-style content from user routes. Phase 2 completes and polishes incomplete pages.

**Tech Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Lucide React · Zustand · localStorage mock persistence · custom DOM events for toasts

## Global Constraints

- Route `/dashboard` is forbidden for users — must be `/my-petradar` (spec violation)
- Sidebar nav must only contain: Map, Report, Lost Pets, Matches, Volunteer, Notifications, Profile
- No `StatCard` components with operational metrics (queue counts, response times, completion rates) in user app pages
- No analytics charts, audit logs, or bulk-action tables in any `apps/web/app/(app)/*` route
- Public/approximate coordinates only in user-facing pages — never read `exactLatitude`/`exactLongitude`
- All feedback via `window.dispatchEvent(new CustomEvent("petradar:toast", { detail: { text: "..." } }))` — no `alert()` or `console.log`
- Mock persistence: `window.localStorage` keyed `petradar:*` for all MVP form submissions
- Mobile-first: every page must be usable on a 375px viewport
- All buttons and links must navigate or produce visible feedback — zero dead UI

---

### File Map

**Phase 1 — Violations Cleanup:**
| Action | File |
|---|---|
| DELETE | `apps/web/app/(app)/analytics/page.tsx` |
| DELETE | `apps/web/app/(app)/rescue-board/page.tsx` |
| CREATE | `apps/web/app/(app)/my-petradar/page.tsx` |
| MODIFY | `apps/web/app/(app)/dashboard/page.tsx` → server redirect |
| MODIFY | `apps/web/app/(auth)/login/page.tsx` → redirect target |
| MODIFY | `apps/web/components/layout/sidebar.tsx` → logo href |
| REWRITE | `apps/web/app/(app)/volunteer/page.tsx` → rescue cards, no StatCards |
| REWRITE | `apps/web/app/(app)/volunteer-profile/page.tsx` → community profile, no StatCards |

**Phase 2 — Complete Missing Pages:**
| Action | File |
|---|---|
| MODIFY | `apps/web/app/(app)/sightings/page.tsx` → card links to detail |
| REWRITE | `apps/web/app/(app)/rescue-cases/[id]/page.tsx` → full volunteer detail |
| ENHANCE | `apps/web/app/(app)/matches/[id]/page.tsx` → richer comparison |

---

### Task 1: Remove Admin-Only Pages from User App

**Files:**
- Delete: `apps/web/app/(app)/analytics/page.tsx`
- Delete: `apps/web/app/(app)/rescue-board/page.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: two fewer routes; no references in sidebar nav (already confirmed)

- [ ] **Step 1: Delete the pages**

```bash
rm apps/web/app/\(app\)/analytics/page.tsx
rm apps/web/app/\(app\)/rescue-board/page.tsx
```

- [ ] **Step 2: Confirm no imports reference the deleted files**

```bash
grep -r "analytics\|rescue-board" apps/web/components apps/web/app --include="*.tsx" --include="*.ts" -l
```

Expected: no output (nothing imports these pages)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: remove admin-only analytics and rescue-board pages from user app"
```

---

### Task 2: Rename /dashboard → /my-petradar

**Files:**
- Create: `apps/web/app/(app)/my-petradar/page.tsx`
- Modify: `apps/web/app/(app)/dashboard/page.tsx`
- Modify: `apps/web/app/(auth)/login/page.tsx` (line 37: `router.push`)
- Modify: `apps/web/components/layout/sidebar.tsx` (line 41: logo `href`)

**Interfaces:**
- Consumes: `mockLostPets`, `mockSightings` from `@/lib/mock-data`; `StatusBadge`; `buttonVariants`
- Produces: `/my-petradar` route; `/dashboard` permanently redirects there; login drops you at `/my-petradar`

- [ ] **Step 1: Create `apps/web/app/(app)/my-petradar/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight, Bell, GitMerge, Heart, MapPin, PawPrint, Plus, ShieldCheck } from "lucide-react";
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

export default function MyPetRadarPage() {
  const nearby = mockSightings.slice(0, 3);
  const pet = mockLostPets[0];

  return (
    <div className="page-shell space-y-5">
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
          <div className="border-t border-border bg-gradient-to-br from-mint/80 to-warm-secondary p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">Your latest case</p>
                  <h2 className="mt-1 text-lg font-bold text-text-strong">{pet?.name ?? "Milo"}</h2>
                  <p className="text-sm text-text-muted">Possible matches are ready to review.</p>
                </div>
                <StatusBadge value="POSSIBLE_MATCH" />
              </div>
              <Link href="/matches" className={buttonVariants({ className: "mt-4 w-full" })}>
                View Matches
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                  {s.location.district ?? "Bangkok"} · {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
```

- [ ] **Step 2: Replace `apps/web/app/(app)/dashboard/page.tsx` with a server redirect**

```tsx
import { redirect } from "next/navigation";

export default function DashboardRedirectPage() {
  redirect("/my-petradar");
}
```

- [ ] **Step 3: Update login to redirect to `/my-petradar`**

In `apps/web/app/(auth)/login/page.tsx`, find `router.push("/dashboard")` and replace with:

```tsx
router.push("/my-petradar");
```

- [ ] **Step 4: Update sidebar logo to link to `/my-petradar`**

In `apps/web/components/layout/sidebar.tsx`, find the logo `Link` (`href="/"`) and replace with:

```tsx
<Link href="/my-petradar" className="flex items-center gap-2.5 px-5 py-5">
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\(app\)/my-petradar apps/web/app/\(app\)/dashboard/page.tsx apps/web/app/\(auth\)/login/page.tsx apps/web/components/layout/sidebar.tsx
git commit -m "fix: rename /dashboard to /my-petradar — add route, redirect old path, update login and logo links"
```

---

### Task 3: Redesign /volunteer Page (Remove Admin Stat Cards)

**Files:**
- Rewrite: `apps/web/app/(app)/volunteer/page.tsx`

**Interfaces:**
- Consumes: `mockRescueCases` from `@/lib/mock-data`; `StatusBadge`; `EmptyState`; `Button`
- Produces: `/volunteer` page with rescue-card grid, no `StatCard`, no operational metrics

Current violation: `StatCard` grid showing "Active Cases 5, Completed 23, Avg Response 1h 24m, Urgent Nearby 12" — these are internal operational metrics, not consumer content.

- [ ] **Step 1: Rewrite `apps/web/app/(app)/volunteer/page.tsx`**

```tsx
import Link from "next/link";
import { AlertTriangle, ChevronRight, Clock, MapPin, PawPrint } from "lucide-react";
import { mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

const assigned = mockRescueCases.filter((rc) => rc.assignedTo).slice(0, 3);
const nearby = mockRescueCases.filter((rc) => rc.status === "OPEN").slice(0, 4);

export default function VolunteerPage() {
  return (
    <div className="page-shell space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">Volunteer Center</h1>
        <p className="mt-1 text-sm text-text-muted">Help rescue animals in your community.</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-strong">My Assigned Cases</h2>
          <span className="text-xs font-bold text-primary">{assigned.length} active</span>
        </div>
        {assigned.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No assigned cases"
            description="Nearby urgent cases will appear below for you to pick up."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {assigned.map((rc) => (
              <Link
                key={rc.id}
                href={`/rescue-cases/${rc.id}`}
                className="group rounded-2xl border border-border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] font-bold text-text-muted">{rc.id}</p>
                    <p className="mt-1 text-sm font-bold text-text-strong">
                      {rc.sighting.color}{" "}
                      {rc.sighting.species.charAt(0) + rc.sighting.species.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <StatusBadge value={rc.priority} />
                </div>
                {rc.sighting.photoUrls[0] ? (
                  <img
                    src={rc.sighting.photoUrls[0]}
                    alt=""
                    className="mt-3 h-32 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mt-3 grid h-32 place-items-center rounded-xl bg-mint text-primary">
                    <PawPrint className="h-8 w-8" />
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {new Date(rc.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <MapPin className="ml-auto h-3.5 w-3.5" />
                  <span>{rc.sighting.location.district ?? "Bangkok"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-mint/50 px-3 py-2 text-xs font-bold text-primary">
                  View & Update
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-strong">Urgent Nearby</h2>
          <Link href="/map" className="text-xs font-bold text-primary">
            See on map
          </Link>
        </div>
        {nearby.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No urgent cases nearby"
            description="Check back soon. New rescues will appear here."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {nearby.map((rc) => (
              <div
                key={rc.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-emergency-red">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <StatusBadge value={rc.priority} />
                </div>
                <p className="mt-3 text-sm font-bold text-text-strong">
                  {rc.sighting.color}{" "}
                  {rc.sighting.species.charAt(0) + rc.sighting.species.slice(1).toLowerCase()}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {rc.sighting.location.district ?? "Bangkok"}
                </p>
                <Link href={`/rescue-cases/${rc.id}`}>
                  <Button className="mt-3 w-full" size="sm">
                    Volunteer for this case
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/volunteer/page.tsx
git commit -m "fix: redesign volunteer page — remove admin stat cards, replace with rescue cards"
```

---

### Task 4: Redesign /volunteer-profile Page (Remove Admin Stat Cards)

**Files:**
- Rewrite: `apps/web/app/(app)/volunteer-profile/page.tsx`

**Interfaces:**
- Consumes: `mockUser`, `mockRescueCases` from `@/lib/mock-data`; `StatusBadge`
- Produces: community-style profile with inline stats, no `StatCard` grid

Current violation: 4 `StatCard` components with operational metrics below profile header.

- [ ] **Step 1: Rewrite `apps/web/app/(app)/volunteer-profile/page.tsx`**

```tsx
import Link from "next/link";
import { Heart, MapPin, ShieldCheck, Star } from "lucide-react";
import { mockUser, mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

const completed = mockRescueCases
  .filter((rc) => rc.status === "RESCUED" || rc.status === "CLOSED")
  .slice(0, 3);

export default function VolunteerProfilePage() {
  return (
    <div className="page-shell max-w-3xl space-y-5">
      <section className="panel overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/10 to-mint" />
        <div className="-mt-10 p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary text-2xl font-bold text-white shadow-soft">
            N
          </div>
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-text-strong">{mockUser.displayName}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-xs font-bold text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified Volunteer
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="h-3.5 w-3.5" /> Bangkok · Active since 2023
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 community rating
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
            {[
              { label: "Cases Assisted", value: "86", icon: Heart, color: "text-primary" },
              { label: "Rescues Completed", value: "42", icon: ShieldCheck, color: "text-reunited-green" },
              { label: "Service Radius", value: "5 km", icon: MapPin, color: "text-soft-blue" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon className={`mx-auto h-5 w-5 ${color}`} />
                <p className="mt-1 text-lg font-bold text-text-strong">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {completed.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-text-strong">Recent Contributions</h2>
          <div className="space-y-2">
            {completed.map((rc) => (
              <Link
                key={rc.id}
                href={`/rescue-cases/${rc.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
              >
                {rc.sighting.photoUrls[0] ? (
                  <img
                    src={rc.sighting.photoUrls[0]}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint text-primary">
                    <Heart className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-strong">
                    {rc.sighting.color}{" "}
                    {rc.sighting.species.charAt(0) + rc.sighting.species.slice(1).toLowerCase()}
                  </p>
                  <p className="text-xs text-text-muted">
                    {rc.sighting.location.district ?? "Bangkok"}
                  </p>
                </div>
                <StatusBadge value={rc.status} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/volunteer-profile/page.tsx
git commit -m "fix: redesign volunteer-profile — remove admin stat cards, add community profile layout"
```

---

### Task 5: Fix Sightings Page — Cards Link to Sighting Detail

**Files:**
- Modify: `apps/web/app/(app)/sightings/page.tsx`

**Interfaces:**
- Consumes: `mockSightings` from `@/lib/mock-data`
- Produces: each sighting card navigates to `/sightings/${s.id}` on click

Current bug: card articles are not wrapped in a Link; the footer "View map" link goes to `/map` instead of the specific sighting detail.

- [ ] **Step 1: Wrap each card in a `<Link>` and fix the footer**

In `apps/web/app/(app)/sightings/page.tsx`:

Change the `<article>` element to a `<Link>`:

```tsx
// Find this:
<article key={s.id} className="panel overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card">

// Replace with:
<Link key={s.id} href={`/sightings/${s.id}`} className="panel block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card">
```

Change the closing `</article>` to `</Link>`.

In the same file, replace the "View map" link at the bottom of each card:

```tsx
// Find this:
<Link href="/map" className="inline-flex items-center gap-1 text-xs font-bold text-primary">
  <Eye className="h-3.5 w-3.5" /> View map
</Link>

// Replace with:
<span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
  <Eye className="h-3.5 w-3.5" /> View detail
</span>
```

Remove `Link` from the import at the top if it's no longer used elsewhere on this page (the Report button still uses `Link`, so keep it).

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/sightings/page.tsx
git commit -m "fix: sightings cards now navigate to sighting detail page"
```

---

### Task 6: Enhance /rescue-cases/[id] — Full Volunteer Detail Page

**Files:**
- Rewrite: `apps/web/app/(app)/rescue-cases/[id]/page.tsx`

**Interfaces:**
- Consumes: `mockRescueCases` from `@/lib/mock-data`; `StatusBadge`; `Button`; `useAuthStore` (for `params`)
- Produces: photo, about card, functional update textarea with toast feedback, timeline sidebar

Current state: very sparse — only a bare textarea and static timeline items with no dates.

- [ ] **Step 1: Rewrite `apps/web/app/(app)/rescue-cases/[id]/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, MapPin, PawPrint, User } from "lucide-react";
import { mockRescueCases } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const timelineBase = [
  { label: "Report submitted", by: "Community reporter" },
  { label: "Admin verified", by: "Admin team" },
  { label: "Volunteer assigned", by: "Rescue coordinator" },
];

export default function RescueCasePage({ params }: { params: { id: string } }) {
  const rescue = mockRescueCases.find((item) => item.id === params.id) ?? mockRescueCases[0];
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function submitUpdate() {
    if (!note.trim()) {
      window.dispatchEvent(
        new CustomEvent("petradar:toast", {
          detail: { text: "Please enter an update note before submitting.", tone: "error" },
        })
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setNote("");
      window.dispatchEvent(
        new CustomEvent("petradar:toast", {
          detail: { text: "Update submitted. The rescue team has been notified." },
        })
      );
    }, 700);
  }

  return (
    <div className="page-shell space-y-5">
      <Link
        href="/volunteer"
        className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-strong"
      >
        <ArrowLeft className="h-4 w-4" /> Volunteer Center
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-text-strong">Case {rescue.id}</h1>
        <StatusBadge value={rescue.status} />
        <StatusBadge value={rescue.priority} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {rescue.sighting.photoUrls[0] ? (
            <img
              src={rescue.sighting.photoUrls[0]}
              alt=""
              className="h-56 w-full rounded-2xl object-cover shadow-card"
            />
          ) : (
            <div className="grid h-56 place-items-center rounded-2xl bg-mint shadow-card">
              <PawPrint className="h-12 w-12 text-primary" />
            </div>
          )}

          <div className="panel p-5">
            <h2 className="text-sm font-bold text-text-strong">About this case</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">{rescue.notes}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-text-muted">
                  <MapPin className="h-3.5 w-3.5" /> Area
                </p>
                <p className="text-sm font-semibold text-text-strong">
                  {rescue.sighting.location.district ?? "Bangkok"}
                </p>
              </div>
              <div className="rounded-xl bg-background p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-text-muted">
                  <User className="h-3.5 w-3.5" /> Assigned to
                </p>
                <p className="text-sm font-semibold text-text-strong">
                  {rescue.assignedTo?.displayName ?? "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-bold text-text-strong">Add update</h2>
            {submitted ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <CheckCircle className="h-5 w-5 text-reunited-green" />
                <p className="text-sm font-bold text-reunited-green">
                  Update submitted successfully.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  className="field mt-3 h-28 py-3"
                  placeholder="Describe what you found or what action you took..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  className="mt-3 w-full"
                  onClick={submitUpdate}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Update"}
                </Button>
              </>
            )}
          </div>
        </div>

        <aside className="panel p-5">
          <h2 className="text-sm font-bold text-text-strong">Timeline</h2>
          <div className="relative mt-4 space-y-5 pl-5 before:absolute before:inset-y-2 before:left-[7px] before:w-0.5 before:bg-border">
            {timelineBase.map((item, index) => (
              <div key={index} className="relative flex gap-3 text-sm">
                <Clock className="absolute -left-[22px] h-3.5 w-3.5 bg-white text-primary" />
                <div>
                  <p className="font-bold text-text-strong">{item.label}</p>
                  <p className="text-xs text-text-muted">by {item.by}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(rescue.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/rescue-cases/
git commit -m "feat: enhance rescue case detail with photo, about card, functional update form, and timeline"
```

---

### Task 7: Enhance /matches/[id] — Richer Match Comparison

**Files:**
- Rewrite: `apps/web/app/(app)/matches/[id]/page.tsx`

**Interfaces:**
- Consumes: `mockMatches` from `@/lib/mock-data`
- Produces: photo side-by-side, score ring, matching reasons list, confirm/reject with toast feedback

Current state: minimal — score number, two photos, two buttons, no matching reasons, no feedback on button actions.

- [ ] **Step 1: Rewrite `apps/web/app/(app)/matches/[id]/page.tsx`**

```tsx
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
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mint text-text-muted text-sm font-bold">
              No photo
            </div>
          )}
          <h2 className="mt-3 text-base font-bold text-text-strong">{match.lostPet.petName}</h2>
          <p className="text-sm text-text-muted">{match.lostPet.color} · {match.lostPet.species}</p>
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
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-mint text-text-muted text-sm font-bold">
              No photo
            </div>
          )}
          <h2 className="mt-3 text-base font-bold text-text-strong">{match.sighting.id}</h2>
          <p className="text-sm text-text-muted">{match.sighting.color} · {match.sighting.species}</p>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-bold text-text-strong">Why they might match</h2>
        <div className="mt-3 space-y-2">
          {MATCH_REASONS.map(({ label, points }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/\(app\)/matches/
git commit -m "feat: enhance match detail page with side-by-side photos, reasons list, and confirm/reject feedback"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task(s) |
|---|---|
| No `/dashboard` route for users | Task 2 |
| No analytics in user app | Task 1 |
| No rescue board in user app | Task 1 |
| Volunteer page: rescue cards, no admin tables | Task 3 |
| Volunteer profile: no admin stat cards | Task 4 |
| All cards must link to detail pages | Task 5 |
| Rescue case detail: functional update form | Task 6 |
| Match detail: richer comparison + feedback | Task 7 |
| Sidebar logo links to user home | Task 2 Step 4 |
| Login → my-petradar | Task 2 Step 3 |

**Placeholder check:** No TBD, no TODO, no "similar to Task N" — all steps contain full code.

**Type consistency:** All pages consume `mockRescueCases` (same shape used in rescue-board and volunteer pages). `StatusBadge` accepts `.value` string throughout. No type name drift between tasks.

---

Plan complete. Scope: User Web App Phase 1 + 2.

**Excluded from this plan (separate plans required):**
- Admin CMS page completions (verification queue, duplicate review, privacy control, rescue management)
- API integration (replace localStorage mock with real NestJS/Prisma endpoints)
- Auth hardening (token refresh, protected route middleware)
