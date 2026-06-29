PetRadar
========

PetRadar is a community animal sighting, lost pet matching, rescue operations, and admin back-office platform.

Architecture
------------

The monorepo separates public/user workflows from admin/CMS workflows.

- `apps/web`: Next.js user-facing web app for guests, reporters, pet owners, and volunteers.
- `apps/admin`: Next.js Admin CMS / Back Office for admins, verifiers, rescue coordinators, analysts, and content editors.
- `apps/api`: NestJS API with Prisma, PostgreSQL/PostGIS, JWT auth, RBAC, and privacy enforcement foundations.
- `packages/ui`: Shared PetRadar UI primitives and operational components.
- `packages/types`: Shared TypeScript domain types.
- `packages/api-client`: Mock API/client layer for user, admin, CMS, analytics, and upload clients.

The two frontends use the same PetRadar design system: deep teal primary, warm off-white background, white cards, soft borders, rounded corners, subtle shadows, status colors, and clean typography.

User App vs Admin CMS
---------------------

`apps/web` is warm, friendly, mobile-first, map-first, and action-oriented. It contains user workflows such as:

- Landing, login, register
- Dashboard and public map
- Animal report flow
- Sightings and sighting detail
- Lost pets, lost pet detail, and create lost pet post
- Possible matches and match detail
- Volunteer dashboard and rescue case update
- Notifications, profile, volunteer profile, settings, safety, and reusable states

`apps/admin` is desktop-first, data-dense, table-heavy, filter-heavy, audit-focused, and operational. It contains:

- Admin login and dashboard
- Verification queue and report detail decision panel
- Report moderation
- Duplicate review
- Rescue operations board and case detail
- Volunteer and user management
- Role management
- Privacy and exact-location access control
- Abuse reports
- Analytics, heatmap, and executive exports
- Content CMS for pages, FAQs, help center, safety guidelines, and announcements
- Audit logs and admin settings

Permission Boundaries
---------------------

The UI separation is intentional, but backend enforcement is still required.

- Public users must only receive approximate `public_latitude` and `public_longitude`.
- Exact coordinates are restricted to Admin, Super Admin, Rescue Coordinator, or explicitly authorized Verified Volunteer.
- Sensitive cases require stricter access.
- Every exact-location access must be logged in `audit_logs`.
- Content Editors can manage CMS content only and must not approve reports, access exact locations, or manage user roles unless explicitly granted.

Quick Start
-----------

Install dependencies:

```bash
npm install
```

Run the user app:

```bash
npm run dev -w web
```

User app URL: `http://localhost:3000`

Run the admin CMS on a separate port:

```bash
npm run dev:admin
```

Admin CMS URL: `http://localhost:3001`

Run the API:

```bash
docker compose up -d db
cp apps/api/.env.example apps/api/.env
npm run prisma:deploy -w api
npm run seed -w api
npm run dev -w api
```

API URL: `http://localhost:4000/api`

Build
-----

Build everything:

```bash
npm run build
```

Build individual apps:

```bash
npm run build -w web
npm run build -w admin
npm run build -w api
```

Functional prototype tests:

```bash
npm run test:functional
```

The current functional prototype also maintains a detailed control checklist in `FUNCTIONAL_CHECKLIST.md`.

Demo Users
----------

All seeded API demo users use password `PetRadar123!`.

- `admin@petradar.demo`
- `volunteer@petradar.demo`
- `owner@petradar.demo`
- `reporter@petradar.demo`

Deployment Notes
----------------

- Deploy `apps/web` and `apps/admin` as separate Vercel/Netlify projects with distinct domains or subdomains.
- Deploy `apps/api` to Render, Railway, or Fly.io.
- Use Supabase Postgres with PostGIS enabled for production database/storage.
- Run `npm run prisma:deploy -w api` during backend deploy before starting the Nest server.
