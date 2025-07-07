
-- Ensure `full_name` is unique and not null in the `profiles` table.
ALTER TABLE profiles
  ALTER COLUMN full_name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_profile_full_name ON profiles (full_name);
