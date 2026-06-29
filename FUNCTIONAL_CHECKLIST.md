# PetRadar Functional Checklist

This file tracks the “zero dead button” requirement for the current functional prototype. Status values:

- `Implemented`: control updates local state, mock storage, navigation, toast feedback, download/print, or guarded access.
- `Prototype`: works with mock data/localStorage and visible feedback; backend persistence still pending.
- `Backend pending`: UI works, but production server enforcement or database persistence is still required.

## Global

- Buttons: `Implemented` through page handlers or shared `ToastProvider` delegated action handling.
- Links/navigation: `Implemented` for user and admin route structures.
- Forms: `Prototype` validation/submission on auth, report animal, lost pet, admin login, plus generic submit feedback.
- Filters/chips: `Prototype` via page state where critical and shared action feedback elsewhere.
- Tables: `Implemented` search, sort, pagination, and row selection in shared `DataTable`.
- Modals/confirmation: `Prototype` destructive delegated actions use confirmation.
- Toasts: `Implemented` through shared `ToastProvider`.
- Loading/error states: `Prototype` present on auth/forms and build-verified pages.
- Access control: `Prototype` admin route guard blocks non-admin local sessions. Backend enforcement remains required.
- Audit logs: `Prototype` sensitive/delegated admin actions append to localStorage audit state. Backend audit logging remains required.

## User Web App

### Landing
- Buttons/links: `Implemented`; report, lost pets, login, register, safety routes navigate.
- Forms/tables: none.

### Login
- Email/password validation: `Implemented`.
- Submit: `Implemented`; writes mock session, shows toast, routes to dashboard.

### Register
- Required fields/role/agreement validation: `Implemented`.
- Role selector: `Implemented`.
- Submit: `Implemented`; writes mock user session/role and routes to dashboard.

### Dashboard
- Cards/detail links: `Implemented`.
- Data state: `Prototype`; reads mock data.

### Map
- Search/species/status/urgency filters: `Implemented`.
- Pin/case selection and mobile sheet: `Implemented`.
- Report navigation: `Implemented`.
- Detail actions: `Prototype`; buttons show feedback or navigate.

### Report Animal
- Step navigation: `Implemented`.
- Required validation: `Implemented`.
- Photo upload/preview/remove: `Implemented`.
- Public radius selection: `Implemented`.
- Submit: `Implemented`; saves mock sighting to localStorage, shows success, exposes detail link.

### Sightings/List/Detail
- Filters/card links/detail actions: `Prototype`.
- Detail add sighting route: `Implemented`.

### Lost Pets/List/New/Detail
- Search/filter controls: `Prototype`.
- Save draft: `Implemented`; localStorage.
- Photo upload/preview/remove: `Implemented`.
- Submit listing: `Implemented`; localStorage and success route.
- Detail actions: `Prototype`; navigate or show feedback.

### Matches/List/Detail
- Match score display: `Implemented`.
- Confirm/reject/request information: `Prototype`; delegated toast/audit feedback.
- Matching scorer utility: `Implemented` in `packages/api-client/src/matching.js`.

### Rescue Board / Rescue Case Detail
- Kanban grouping/detail links: `Implemented`.
- Update note/status buttons: `Prototype`; visible feedback. Full server workflow backend pending.

### Volunteer Dashboard/Profile
- Assigned case links/actions: `Prototype`.
- Profile stats: `Implemented` mock state.

### Notifications
- Tabs: `Implemented`.
- Mark one/all read: `Implemented`.
- Related links: `Implemented`.

### Profile/Settings/Safety/States
- Preference/settings/report-abuse style actions: `Prototype`; visible feedback.
- Empty/error/loading states board: `Implemented`.

## Admin CMS

### Admin Login
- Validation/session/role selector: `Implemented`.
- Non-admin role selection blocks protected admin routes: `Implemented` via local guard.

### Admin Shell
- Navigation: `Implemented`.
- Logout: `Implemented`; clears admin session.

### Dashboard
- Stat cards/recent actions/system health: `Implemented` mock.
- Review queue action: `Prototype`; feedback.

### Verification Queue
- Filters: `Prototype`.
- Table search/sort/pagination/selection: `Implemented`.
- Bulk approve/reject/duplicate/convert: `Prototype`; confirmation/toast/audit feedback.
- Detail links: `Implemented`.

### Report Detail
- Status/dropdowns/note fields: `Prototype`.
- Save decision/request exact location: `Prototype`; toast/audit feedback.
- Similar sighting links: `Implemented`.

### Reports
- Moderation table/search/sort/pagination: `Implemented`.
- Row approve/reject: `Prototype`; confirmation/toast/audit feedback.

### Duplicate Review
- Merge/keep separate/mark uncertain: `Prototype`; destructive confirmation and audit feedback.

### Rescue Operations
- Kanban columns and detail links: `Implemented`.
- Assign/update/add note: `Prototype`.

### Volunteers/Users/Roles
- Table search/sort/pagination/profile links: `Implemented`.
- Verify/suspend/change role/edit permissions: `Prototype`; confirmation/toast/audit feedback.

### Privacy
- Role checkboxes/sensitive toggle/save: `Prototype`; local UI and audit feedback.
- Exact location server enforcement: `Backend pending`.

### Abuse Reports
- List/detail/decision actions: `Prototype`.

### Analytics/Heatmap/Reports Export
- Date/filter/share/save-view controls: `Prototype`.
- CSV export: `Implemented` mock CSV download from shared action handler.
- PDF export: `Prototype` uses print dialog.

### Content CMS
- Section navigation: `Implemented`.
- Create/save/publish/delete actions: `Prototype`; toast/audit feedback.
- User-facing CMS rendering: `Backend pending`.

### Audit Logs
- Table search/sort/pagination: `Implemented`.
- Local delegated actions store audit entries in localStorage; persisted API audit logging is `Backend pending`.

## Automated Tests

- `npm run test:functional`: implemented.
- Covers matching score calculation, notification read state, approximate location privacy rule, and audit action shape.

## Known Backend Pending Items

- Server-side route guards and role enforcement for every API.
- Exact-coordinate access authorization and database audit writes.
- Real upload storage and image reference persistence.
- Real TanStack Query server-state integration.
- Production CMS content rendering into public pages.