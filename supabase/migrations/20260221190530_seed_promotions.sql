INSERT INTO public.active_promotions (
  title,
  bonus_percentage,
  origin,
  destination,
  link,
  rules_summary,
  valid_until
) VALUES
(
  'Até 100% de bônus na transferência para Smiles',
  100,
  'Livelo',
  'Smiles',
  'https://www.livelo.com.br',
  'Exclusivo para assinantes do Clube Smiles ou Clube Livelo.',
  NOW() + INTERVAL '45 days'
),
(
  'Transfira Esfera para TudoAzul com até 80% de bônus',
  80,
  'Esfera',
  'TudoAzul',
  'https://www.esfera.com.vc',
  'Bonificação progressiva conforme o plano do Clube TudoAzul.',
  NOW() + INTERVAL '35 days'
),
(
  'Bônus de 30% na transferência para Latam Pass',
  30,
  'Itaú/PDA',
  'Latam Pass',
  'https://latampass.latam.com',
  'Válido para todos os bancos parceiros exceto Santander.',
  NOW() + INTERVAL '40 days'
),
(
  'Compre pontos Livelo com 50% de desconto',
  0,
  'Livelo',
  'Livelo',
  'https://www.livelo.com.br',
  'Desconto aplicado diretamente no carrinho para membros do Clube.',
  NOW() + INTERVAL '60 days'
);
