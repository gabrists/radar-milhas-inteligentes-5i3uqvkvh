import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface PricePayload {
  program_name: string;
  base_price: number;
  discount_percentage: number;
  promotion_link?: string;
}

interface SyncRequest {
  secret: string;
  prices: PricePayload[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SyncRequest = await req.json();
    const { secret, prices } = body;

    const cronSecret = Deno.env.get('CRON_SECRET');

    // Security validation
    if (!cronSecret || secret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (prices && prices.length > 0) {
      const upsertData = prices.map(p => ({
        program_name: p.program_name,
        best_price_milheiro: p.base_price * (1 - p.discount_percentage / 100),
        discount_percentage: p.discount_percentage,
        promotion_link: p.promotion_link || null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('program_prices')
        .upsert(upsertData, { onConflict: 'program_name' });

      if (error) {
        throw error;
      }
    }

    return new Response(JSON.stringify({ message: 'Preços sincronizados com sucesso!' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
