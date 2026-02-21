DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'viajante@example.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
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
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'viajante@example.com',
      crypt('123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Viajante Teste", "full_name": "Viajante Teste"}',
      false,
      'authenticated',
      'authenticated',
      '', '', '', '', '', '', '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('123', gen_salt('bf')),
      raw_user_meta_data = '{"name": "Viajante Teste", "full_name": "Viajante Teste"}',
      updated_at = NOW(),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      phone = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = ''
    WHERE id = v_user_id;
  END IF;

  -- Upsert profile directly
  INSERT INTO public.profiles (id, full_name, plan_type)
  VALUES (v_user_id, 'Viajante Teste', 'premium')
  ON CONFLICT (id) DO UPDATE 
  SET full_name = 'Viajante Teste', plan_type = 'premium', updated_at = NOW();
END
$$;
