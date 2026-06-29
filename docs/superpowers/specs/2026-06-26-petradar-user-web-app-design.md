# PetRadar — User Web App Design Spec

**Date:** 2026-06-26
**Phase:** Phase 1 — User Web App (Next.js, mock data)
**Status:** Approved, ready for implementation

---

## 1. Context and Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 App Router | Specified in product brief |
| Existing Angular app | Replaced (deleted) | `apps/web` Angular 18 app removed; fresh Next.js in its place |
| Admin CMS | Phase 2 | Not built yet; user web app first |
| Backend | Mock data only | Real NestJS API in `apps/api` exists but not wired in phase 1 |
| Architecture | Self-contained in `apps/web` | No shared packages yet; extracted in phase 2 when admin is real |
| UI library | shadcn/ui + Tailwind CSS | Per spec; Angular Material removed |
| State | Zustand for client state | No TanStack Query for mock phase |
| Map | react-leaflet, dynamically imported | Leaflet requires DOM; `next/dynamic` with `ssr: false` |

---

## 2. App Overview

PetRadar is a community animal sighting, lost pet matching, and rescue operations platform. The user web app serves guests, reporters, pet owners, and volunteers. It is map-first, mobile-responsive, warm in tone, and action-oriented.

The app is a clickable UI prototype with realistic mock data. No real backend calls in phase 1.

---

## 3. Folder Structure

```
apps/web/
  src/
    app/
      (public)/
        page.tsx          # Landing page
        layout.tsx
      (auth)/
        login/page.tsx
        register/page.tsx
        layout.tsx
      (app)/
        layout.tsx        # AppShell: sidebar + topbar + mobile nav
        dashboard/page.tsx
        map/page.tsx
        report/page.tsx
        sightings/
          page.tsx
          [id]/page.tsx
        lost-pets/
          page.tsx
          new/page.tsx
          [id]/page.tsx
        matches/
          page.tsx
          [id]/page.tsx
        rescue-board/page.tsx
        rescue-cases/[id]/page.tsx
        volunteer/page.tsx
        heatmap/page.tsx
        analytics/page.tsx
        reports/page.tsx
        notifications/page.tsx
        profile/page.tsx
        volunteer-profile/page.tsx
        settings/page.tsx
        safety/page.tsx
        states/page.tsx

    components/
      layout/
        AppShell.tsx
        Sidebar.tsx
        TopBar.tsx
        MobileBottomNav.tsx
        PageHeader.tsx
      ui/
        StatusBadge.tsx
        UrgencyBadge.tsx
        MatchScoreBadge.tsx
        VerificationBadge.tsx
        StatCard.tsx
        FilterBar.tsx
        SearchInput.tsx
        UserAvatar.tsx
        NotificationItem.tsx
        Timeline.tsx
        PrivacyWarningBanner.tsx
        SafetyAlertBanner.tsx
      cards/
        AnimalCard.tsx
        LostPetCard.tsx
        RescueCaseCard.tsx
      map/
        MapPin.tsx
        MapCluster.tsx
        MapDrawer.tsx
        MapContainer.tsx   # dynamically imported wrapper
      forms/
        FormSection.tsx
        Stepper.tsx
        UploadDropzone.tsx
      charts/
        DonutChart.tsx
        LineChart.tsx
        BarChart.tsx
      states/
        EmptyStateCard.tsx
        LoadingStateCard.tsx
        ErrorStateCard.tsx

    lib/
      mock-data/
        sightings.ts
        lost-pets.ts
        matches.ts
        rescue-cases.ts
        notifications.ts
        users.ts
        analytics.ts
      mock-api/
        sightings-api.ts
        lost-pets-api.ts
        matches-api.ts
        rescue-api.ts
        notifications-api.ts
        analytics-api.ts
      utils.ts
      constants.ts

    types/
      user.ts
      sighting.ts
      lost-pet.ts
      match.ts
      rescue.ts
      notification.ts
      analytics.ts

    store/
      auth.store.ts
      map.store.ts
      report.store.ts
      lost-pet-form.store.ts
```

---

## 4. Design System

### Color Tokens (tailwind.config.ts)

```ts
colors: {
  background:    '#F8FAF7',
  'warm-bg':     '#F6F3EE',
  surface:       '#FFFFFF',
  border:        '#E5E7EB',
  'text-strong': '#1F2933',
  'text-muted':  '#6B7280',
  primary:       '#0F766E',   // deep teal
  'primary-dark':'#0B5F59',
  mint:          '#DDF7EC',
  amber:         '#F59E0B',
  'emergency-red':'#EF4444',
  'reunited-green':'#22C55E',
  'match-purple': '#8B5CF6',
  'soft-blue':   '#3B82F6',
  'gray-unverified':'#9CA3AF',
}
```

### Typography

- Font: Inter via `next/font/google`
- Display: 48px bold
- H1: 32px bold
- H2: 24px semibold
- H3: 20px semibold
- Body: 14–16px regular
- Caption: 12–13px

### Component Inventory

All components built from scratch using shadcn/ui primitives (Button, Card, Badge, Tabs, Dialog, Sheet, DropdownMenu, Form, Table, Switch, Popover, Tooltip):

**Badges:**
- `StatusBadge` — maps 15 statuses (New, Sighting, Needs Attention, Injured, Needs Rescue, Verified, Possible Match, Volunteer Assigned, At Clinic, Reunited, Closed, Pending Verification, Rejected, Duplicate, Watching) to color-coded pills
- `UrgencyBadge` — Low (gray), Medium (amber), High (orange), Emergency (red) with icons
- `MatchScoreBadge` — percentage with purple ring indicator
- `VerificationBadge` — verified tick / pending dot / rejected X

**Cards:**
- `AnimalCard` — photo, case ID, species icon, status badge, urgency badge, location, time ago
- `LostPetCard` — pet photo, name, breed, last seen, possible match count badge, reunited badge
- `RescueCaseCard` — compact kanban card with animal photo, ID, urgency, assigned volunteer avatar

**Map:**
- `MapPin` — custom `L.divIcon` SVG shapes:
  - Sighting: teal paw icon
  - Attention: amber exclamation circle
  - Emergency: red pulsing icon
  - Reunited: green heart icon
  - Possible match: purple star icon
- `MapCluster` — colored circle (blue/orange/red based on severity) with count label
- `MapDrawer` — desktop: fixed right panel in CSS grid; mobile: shadcn `Sheet` sliding from bottom

**Layout:**
- `Sidebar` — 240px fixed left, brand logo, nav links with active state via `usePathname()`, collapsed on mobile
- `TopBar` — search, notification bell, user avatar menu
- `MobileBottomNav` — 5 tabs: Home, Map, Report (+), Alerts, Profile
- `PageHeader` — title, subtitle, optional action buttons

**Forms:**
- `Stepper` — horizontal step indicator showing current/completed/upcoming steps
- `FormSection` — labeled card wrapper with optional description
- `UploadDropzone` — drag/drop, preview grid, remove button per image

**Data display:**
- `StatCard` — large number, label, optional trend ↑/↓ arrow and delta
- `FilterBar` — horizontal chip row with `All` + category chips, active highlight
- `Timeline` — vertical step list: icon, timestamp, actor, description
- `DataTable` — sortable, filterable table used in volunteer and list views

**States:**
- `EmptyStateCard` — icon, title, body, optional CTA button
- `LoadingStateCard` — skeleton pulse matching the real card shape
- `ErrorStateCard` — error icon, message, retry button

---

## 5. Routes and Pages

### Public Group — no auth, minimal layout

| Route | Page | Key elements |
|-------|------|-------------|
| `/` | Landing | Hero headline, CTA buttons, map preview with colored pins, animated stats row, 5 feature cards, privacy footer banner |
| `/login` | Login | Centered card, logo, email/password, remember me, forgot password, trust card |
| `/register` | Register | Logo, full name, email, password, 3 role selector cards (Reporter/Pet Owner/Volunteer), agreement checkbox |

### App Group — authenticated, AppShell layout

| Route | Page | Key elements |
|-------|------|-------------|
| `/dashboard` | Overview dashboard | 4 stat cards, activity feed, nearby urgent cases, volunteer CTA, quick report button |
| `/map` | Map dashboard | Full-viewport Leaflet map, left case list panel, filter chips, right detail drawer, floating report button, privacy banner |
| `/report` | Report animal (6 steps) | Step 1: animal type; Step 2: condition; Step 3: details (color/pattern/collar/size/description); Step 4: photos (dropzone); Step 5: location (map picker + radius toggle); Step 6: review + submit + success state |
| `/sightings` | Sightings list | Search, filter chips, AnimalCard grid, empty/loading states |
| `/sightings/[id]` | Case detail | Photo gallery, status/urgency badges, location card (exact locked), timeline, public update card, internal notes, rescue workflow steps, case action buttons |
| `/lost-pets` | Lost pets list | Search, species/distance/color filters, "has matches" checkbox, LostPetCards, Post Lost Pet button |
| `/lost-pets/new` | New lost pet (3 steps) | Step 1: identity (name/species/breed/sex/age/size); Step 2: appearance + photos; Step 3: last seen map + date + contact |
| `/lost-pets/[id]` | Lost pet detail | Gallery, possible matches panel with MatchScoreBadge, pet info cards, appearance card, contact card, last seen map, edit/reunited/poster actions |
| `/matches` | Matches list | Filterable list of possible sighting matches with scores, distances, match reasons |
| `/matches/[id]` | Match review | Side-by-side lost pet + sighting cards, MatchScoreBadge center, matching reasons checklist, confirm/reject/request-info actions |
| `/rescue-board` | Rescue kanban | 9 columns (New Report → Closed), RescueCaseCards with urgency and volunteer avatar |
| `/rescue-cases/[id]` | Rescue case detail | Case header, gallery, timeline, internal notes, accept/assign/update/add-note actions |
| `/volunteer` | Volunteer dashboard | Greeting, stats (active/completed/avg response), assigned cases, nearby urgent cases, cases needing verification, encouragement card |
| `/heatmap` | Community heatmap | Leaflet map with heat layer, filter panel (species/condition/status/time range/verified-only), insight sidebar with charts and AI insight cards |
| `/analytics` | Analytics dashboard | Date range selector, export button, donut charts (species/status), line chart (reports over time), bar chart (rescue by status), match success rate card |
| `/reports` | Executive report | Monthly report, stats cards, hotspots list, heatmap preview, rescue progress chart, match outcomes, top insights |
| `/notifications` | Notification center | Tabs (All/Unread/Cases/Matches/System), NotificationItem list with unread dot, time ago, related case ID |
| `/profile` | User profile | Avatar, role, location, tabs (Activity/Reports/Lost Pets/Saved/Volunteer Cases), notification prefs, privacy prefs |
| `/volunteer-profile` | Volunteer profile | Verified badge, rating, service area map, availability table, skills/roles chips, stats, about me |
| `/settings` | Settings | Account, notifications, privacy, appearance sections |
| `/safety` | Safety & guidelines | Emergency banner, guideline cards (Stay Safe / Location Privacy / Responsible Reporting / Report Abuse / Our Commitment / Need Help) |
| `/states` | States board | Dev/design QA page (not user-facing): all EmptyStateCard, LoadingStateCard, ErrorStateCard variants displayed |

---

## 6. Mock Data

### Sightings (8 records)

All in Bangkok neighborhoods:

| ID | Species | Condition | Area | Status | Urgency |
|----|---------|-----------|------|--------|---------|
| CAT-00021 | Cat | Injured | Ari | Needs Rescue | Emergency |
| DOG-00014 | Dog | Normal stray | Chatuchak | Verified | Low |
| CAT-00018 | Cat | Possible lost pet | Victory Monument | Possible Match | Medium |
| DOG-00009 | Dog | Injured | Lat Phrao | Volunteer Assigned | High |
| CAT-00023 | Cat | Normal stray | Ratchada | New | Low |
| DOG-00011 | Dog | Pregnant | Saphan Khwai | Watching | Medium |
| CAT-00019 | Cat | Sick | Bang Sue | Needs Attention | High |
| DOG-00016 | Dog | Normal stray | Din Daeng | Verified | Low |

Coordinates: realistic Bangkok lat/lng pairs.

### Lost Pets (3 records)

| Name | Species | Breed | Status | Matches |
|------|---------|-------|--------|---------|
| Milo | Cat | Orange tabby | Lost | 2 possible matches |
| Luna | Dog | Golden retriever | Lost | 1 possible match |
| Simba | Cat | Black and white tuxedo | Reunited | 0 |

### Matches (3 records)

| Lost Pet | Sighting | Score | Distance |
|----------|---------|-------|---------|
| Milo (CAT-00018) | 91% | 0.3 km | 4 hours |
| Milo (CAT-00021) | 62% | 1.2 km | 12 hours |
| Luna (DOG-00009) | 78% | 0.8 km | 2 hours |

### Rescue Cases (5 records, one per kanban column)

One case each in: New Report, Watching, Volunteer Assigned, At Clinic, Foster Needed.

### Users

| Name | Role | Used in |
|------|------|---------|
| Nicha P. | Pet Owner / Volunteer / Admin | Profile pages, volunteer dashboard, admin actions |
| Somchai R. | Reporter | Case reporter info |
| Karn T. | Trusted Reporter | Verified badge on reports |

### Notifications (12 records)

Types: possible match found, report verified, report rejected, volunteer assigned, case status updated, admin requested info, nearby urgent rescue.

### Analytics (30-day mock)

- Daily sightings count (line chart)
- Species breakdown: 55% Cat, 38% Dog, 7% Other (donut)
- Status breakdown: 30% Verified, 25% New, 20% Watching, 15% Rescue, 10% Resolved (donut)
- Rescue by status: bar chart
- Match success rate: 68%

---

## 7. State Management

### Zustand Stores

**`useAuthStore`**
```ts
{ user: User | null, role: Role, setUser, logout }
```
Initialized with Nicha P. as logged-in user (mock).

**`useMapStore`**
```ts
{ selectedSighting: Sighting | null, filters: MapFilters, isDrawerOpen: boolean,
  selectSighting, clearSelection, setFilters, toggleDrawer }
```

**`useReportStore`**
```ts
{ step: number, formData: Partial<ReportForm>, setStep, setFormData, reset }
```
Persists across the 6-step report flow.

**`useLostPetFormStore`**
```ts
{ step: number, formData: Partial<LostPetForm>, setStep, setFormData, reset }
```
Persists across the 3-step lost pet creation flow.

---

## 8. Map Strategy

- **Library:** `react-leaflet` v4
- **Import:** `next/dynamic(() => import('@/components/map/MapContainer'), { ssr: false })`
- **Tiles:** OpenStreetMap (no API key required)
- **Custom pins:** `L.divIcon` with inline SVG, styled with CSS classes
- **Clustering:** `react-leaflet-cluster` for dense pin groups
- **Heatmap:** `leaflet.heat` loaded via dynamic import client-side only
- **Mobile map drawer:** shadcn `Sheet` component anchored to bottom
- **Desktop right panel:** CSS Grid layout within the map page (not a modal)

---

## 9. Build Order

| Phase | Tasks |
|-------|-------|
| 1 | Delete Angular `apps/web`; scaffold Next.js with App Router + TypeScript + Tailwind |
| 2 | Install shadcn/ui, configure Tailwind tokens, set up Inter font |
| 3 | Create all TypeScript types in `types/` |
| 4 | Create all mock data in `lib/mock-data/` and mock API in `lib/mock-api/` |
| 5 | Build Zustand stores |
| 6 | Build layout: AppShell, Sidebar, TopBar, MobileBottomNav, PageHeader |
| 7 | Build all UI primitives: badges, StatCard, FilterBar, Timeline, state cards |
| 8 | Build cards: AnimalCard, LostPetCard, RescueCaseCard |
| 9 | Build public pages: Landing, Login, Register |
| 10 | Build map dashboard (most complex — early while context is clear) |
| 11 | Build report animal 6-step flow |
| 12 | Build sightings list + case detail |
| 13 | Build lost pets list + new post + detail |
| 14 | Build matches list + match review detail |
| 15 | Build rescue board + rescue case detail |
| 16 | Build volunteer dashboard |
| 17 | Build heatmap page |
| 18 | Build analytics + reports pages |
| 19 | Build notifications + profile + volunteer profile + settings + safety |
| 20 | Build states board; mobile QA pass; visual polish |

---

## 10. Out of Scope (Phase 1)

- Admin CMS (`apps/admin`) — phase 2
- Real API connection to `apps/api` — phase 2
- TanStack Query — added when real API is wired
- Authentication with real JWT tokens — phase 2
- Push notifications — phase 2
- PDF/CSV export (buttons visible but non-functional) — phase 2
- Drag-and-drop on rescue kanban — visual layout only in phase 1
- Real image upload — `UploadDropzone` shows previews but doesn't POST
- `packages/ui` extraction — phase 2 when admin app is real

---

## 11. Quality Constraints

- Every route has a fully polished, data-dense UI — no "coming soon" pages
- Consistent spacing using Tailwind's 4-point grid
- Consistent `rounded-xl` for cards, `rounded-lg` for inner elements, `rounded-full` for badges
- `shadow-sm` for cards, `shadow-md` for modals/drawers
- `border border-border` on all cards
- Mobile: no horizontal scroll, touch-friendly tap targets (min 44px)
- Map page must not be broken on mobile
- No random colors outside the design token set
- No default browser UI (no native `<select>`, no unstyled `<input>`)
