
-- Set the 'role' for the user with the provided email to 'admin'.
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'mumov68@gmail.com'
);
