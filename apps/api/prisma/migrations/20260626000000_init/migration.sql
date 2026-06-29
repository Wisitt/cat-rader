CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "UserRole" AS ENUM ('GUEST', 'REPORTER', 'PET_OWNER', 'VOLUNTEER', 'ADMIN');
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'OTHER');
CREATE TYPE "SightingStatus" AS ENUM ('STRAY', 'INJURED', 'POSSIBLE_LOST', 'RESCUE_NEEDED', 'RESOLVED');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'DUPLICATE');
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE "LostPetStatus" AS ENUM ('ACTIVE', 'FOUND', 'CLOSED');
CREATE TYPE "MatchDecision" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
CREATE TYPE "RescueStatus" AS ENUM ('NEW', 'ASSIGNED', 'EN_ROUTE', 'IN_CARE', 'RESOLVED', 'CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('MATCH_FOUND', 'REPORT_VERIFIED', 'RESCUE_ASSIGNED', 'STATUS_UPDATED');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role "UserRole" NOT NULL DEFAULT 'REPORTER',
  refresh_token_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE animal_sightings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  species "Species" NOT NULL,
  color text NOT NULL,
  pattern text,
  description text NOT NULL,
  status "SightingStatus" NOT NULL DEFAULT 'STRAY',
  urgency "Urgency" NOT NULL DEFAULT 'MEDIUM',
  verification_status "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  photo_urls text[] NOT NULL DEFAULT '{}',
  exact_latitude numeric(9, 6) NOT NULL,
  exact_longitude numeric(9, 6) NOT NULL,
  public_latitude numeric(9, 6) NOT NULL,
  public_longitude numeric(9, 6) NOT NULL,
  exact_location geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(exact_longitude::double precision, exact_latitude::double precision), 4326)::geography) STORED,
  public_location geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(public_longitude::double precision, public_latitude::double precision), 4326)::geography) STORED,
  seen_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lost_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_name text NOT NULL,
  species "Species" NOT NULL,
  color text NOT NULL,
  pattern text,
  description text NOT NULL,
  has_collar boolean NOT NULL DEFAULT false,
  photo_urls text[] NOT NULL DEFAULT '{}',
  status "LostPetStatus" NOT NULL DEFAULT 'ACTIVE',
  exact_latitude numeric(9, 6) NOT NULL,
  exact_longitude numeric(9, 6) NOT NULL,
  public_latitude numeric(9, 6) NOT NULL,
  public_longitude numeric(9, 6) NOT NULL,
  exact_location geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(exact_longitude::double precision, exact_latitude::double precision), 4326)::geography) STORED,
  public_location geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(public_longitude::double precision, public_latitude::double precision), 4326)::geography) STORED,
  last_seen_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_pet_id uuid NOT NULL REFERENCES lost_pets(id) ON DELETE CASCADE,
  sighting_id uuid NOT NULL REFERENCES animal_sightings(id) ON DELETE CASCADE,
  score integer NOT NULL,
  level text NOT NULL,
  reasons text[] NOT NULL DEFAULT '{}',
  decision "MatchDecision" NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lost_pet_id, sighting_id)
);

CREATE TABLE rescue_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id uuid NOT NULL UNIQUE REFERENCES animal_sightings(id) ON DELETE CASCADE,
  assigned_volunteer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status "RescueStatus" NOT NULL DEFAULT 'NEW',
  priority "Urgency" NOT NULL DEFAULT 'MEDIUM',
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE case_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id uuid NOT NULL REFERENCES rescue_cases(id) ON DELETE CASCADE,
  from_status "RescueStatus",
  to_status "RescueStatus" NOT NULL,
  note text,
  created_by_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id uuid NOT NULL REFERENCES rescue_cases(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type "NotificationType" NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_role_idx ON users(role);
CREATE INDEX animal_sightings_species_idx ON animal_sightings(species);
CREATE INDEX animal_sightings_status_idx ON animal_sightings(status);
CREATE INDEX animal_sightings_verification_status_idx ON animal_sightings(verification_status);
CREATE INDEX animal_sightings_created_at_idx ON animal_sightings(created_at);
CREATE INDEX animal_sightings_exact_location_gix ON animal_sightings USING GIST(exact_location);
CREATE INDEX animal_sightings_public_location_gix ON animal_sightings USING GIST(public_location);
CREATE INDEX lost_pets_species_idx ON lost_pets(species);
CREATE INDEX lost_pets_status_idx ON lost_pets(status);
CREATE INDEX lost_pets_created_at_idx ON lost_pets(created_at);
CREATE INDEX lost_pets_exact_location_gix ON lost_pets USING GIST(exact_location);
CREATE INDEX lost_pets_public_location_gix ON lost_pets USING GIST(public_location);
CREATE INDEX match_results_score_idx ON match_results(score);
CREATE INDEX match_results_decision_idx ON match_results(decision);
CREATE INDEX rescue_cases_status_idx ON rescue_cases(status);
CREATE INDEX rescue_cases_priority_idx ON rescue_cases(priority);
CREATE INDEX rescue_cases_created_at_idx ON rescue_cases(created_at);
CREATE INDEX case_status_history_rescue_case_id_idx ON case_status_history(rescue_case_id);
CREATE INDEX internal_notes_rescue_case_id_idx ON internal_notes(rescue_case_id);
CREATE INDEX internal_notes_author_id_idx ON internal_notes(author_id);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_at_idx ON notifications(read_at);
CREATE INDEX audit_logs_actor_id_idx ON audit_logs(actor_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
