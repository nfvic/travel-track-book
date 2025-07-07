
-- Assign "operator" role to your currently signed-in user.
-- Replace the email address with your email if needed.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'operator'::app_role FROM auth.users WHERE email = 'n.f.vic99@gmail.com'
ON CONFLICT DO NOTHING;

-- (Optional) If you want to always add "operator" role to new users automatically,
-- let me know and I can help you automate it with a trigger or function.
