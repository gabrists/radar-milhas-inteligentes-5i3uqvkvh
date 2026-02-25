ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('Acúmulo', 'Transferência', 'Compra', 'Resgate', 'Expiração'));

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.loyalty_balances(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.expiring_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.loyalty_balances(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.expiring_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expiring points"
  ON public.expiring_points
  FOR ALL USING (
    wallet_id IN (SELECT id FROM public.loyalty_balances WHERE user_id = auth.uid())
  ) WITH CHECK (
    wallet_id IN (SELECT id FROM public.loyalty_balances WHERE user_id = auth.uid())
  );

DELETE FROM public.transactions WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.expiring_points WHERE wallet_id IN (SELECT id FROM public.loyalty_balances WHERE user_id = '00000000-0000-0000-0000-000000000001');
DELETE FROM public.loyalty_balances WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.travel_goals WHERE user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO public.loyalty_balances (id, user_id, program_name, balance)
VALUES 
  ('22222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000001', 'Livelo', 48000),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Smiles', 36000),
  ('22222222-2222-2222-2222-222222222223', '00000000-0000-0000-0000-000000000001', 'Latam Pass', 20000),
  ('22222222-2222-2222-2222-222222222224', '00000000-0000-0000-0000-000000000001', 'Esfera', 10000),
  ('22222222-2222-2222-2222-222222222225', '00000000-0000-0000-0000-000000000001', 'TudoAzul', 6000);

INSERT INTO public.expiring_points (wallet_id, amount, expiration_date)
VALUES 
  ('22222222-2222-2222-2222-222222222221', 5000, NOW() + INTERVAL '45 days'),
  ('22222222-2222-2222-2222-222222222222', 12000, NOW() + INTERVAL '120 days');

INSERT INTO public.transactions (user_id, wallet_id, type, points_amount, transaction_date, description, origin_program, destination_program)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221', 'Acúmulo', 15000, NOW() - INTERVAL '2 days', 'Bônus Cartão de Crédito', 'Livelo', null),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Transferência', 20000, NOW() - INTERVAL '10 days', 'Transferência com 100% bônus', 'Livelo', 'Smiles'),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222223', 'Resgate', 5000, NOW() - INTERVAL '15 days', 'Passagem para o Rio', 'Latam Pass', null),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222221', 'Expiração', 1000, NOW() - INTERVAL '20 days', 'Pontos expirados', 'Livelo', null);

INSERT INTO public.travel_goals (id, user_id, destination_name, target_miles, current_miles, target_date, is_active)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'Viagem para Nova York - Locações de Filmes',
  120000,
  78000,
  '2026-12-01',
  true
);
