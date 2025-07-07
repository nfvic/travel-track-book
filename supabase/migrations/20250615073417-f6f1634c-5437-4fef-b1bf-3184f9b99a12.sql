
-- Update the handle_new_user trigger function to set 'role' in profiles from the new user's metadata.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    (
      CASE
        WHEN NEW.raw_user_meta_data ? 'role' 
        THEN NEW.raw_user_meta_data->>'role'
        ELSE NULL
      END
    )::public.app_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
