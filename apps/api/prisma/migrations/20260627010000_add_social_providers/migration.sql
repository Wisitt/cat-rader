ALTER TYPE "AuthProvider" ADD VALUE IF NOT EXISTS 'LINE';
ALTER TYPE "AuthProvider" ADD VALUE IF NOT EXISTS 'FACEBOOK';

CREATE TABLE auth_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  return_to text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_handoffs_user_id_idx ON auth_handoffs(user_id);
CREATE INDEX auth_handoffs_expires_at_idx ON auth_handoffs(expires_at);
