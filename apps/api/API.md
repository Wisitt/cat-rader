PetRadar API
============

Base URL: `/api`

Swagger is available at `/api/docs` when the Nest server is running.

Authentication
--------------

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Sightings
---------

- `POST /sightings`
- `GET /sightings`
- `GET /sightings/:id`
- `PATCH /sightings/:id`
- `DELETE /sightings/:id`
- `POST /sightings/:id/verify`
- `POST /sightings/:id/reject`
- `POST /sightings/:id/convert-to-rescue`

Map
---

- `GET /map/sightings`
- `GET /map/nearby`
- `GET /map/heatmap`

Lost Pets
---------

- `POST /lost-pets`
- `GET /lost-pets`
- `GET /lost-pets/:id`
- `PATCH /lost-pets/:id`
- `POST /lost-pets/:id/run-matching`
- `GET /lost-pets/:id/matches`

Matches
-------

- `GET /matches`
- `GET /matches/:id`
- `POST /matches/:id/confirm`
- `POST /matches/:id/reject`

Rescue Cases
------------

- `POST /rescue-cases`
- `GET /rescue-cases`
- `GET /rescue-cases/:id`
- `PATCH /rescue-cases/:id/status`
- `POST /rescue-cases/:id/assign-volunteer`
- `POST /rescue-cases/:id/notes`
- `GET /rescue-cases/:id/timeline`

Admin
-----

- `GET /admin/reports/pending`
- `GET /admin/verification-queue`
- `POST /admin/reports/:id/approve`
- `POST /admin/reports/:id/reject`
- `POST /admin/reports/:id/merge`
- `POST /admin/reports/:id/convert-to-rescue`

Analytics
---------

- `GET /analytics/summary`
- `GET /analytics/by-species`
- `GET /analytics/by-status`
- `GET /analytics/hotspots`

Privacy Rule
------------

Public users receive only `location` with approximate coordinates. Admins and volunteers receive exact coordinates from privileged API responses. The API serializer performs this server-side; the frontend does not own the privacy decision.
