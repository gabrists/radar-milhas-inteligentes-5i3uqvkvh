INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone,
  phone_change,
  phone_change_token,
  reauthentication_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'viajante@example.com',
  crypt('Viajante123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Viajante Especial"}',
  false,
  'authenticated',
  'authenticated',
  '', '', '', '', '', '', '', '', ''
);

INSERT INTO public.profiles (id, full_name, plan_type)
VALUES ('00000000-0000-0000-0000-000000000001', 'Viajante Especial', 'premium');

INSERT INTO public.travel_goals (id, user_id, destination_name, target_miles, current_miles, target_date)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Viagem para Orlando - Disney e Universal',
  120000,
  45000,
  '2026-12-01'
);
