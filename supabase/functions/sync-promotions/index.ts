import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Promotion {
  title: string
  origin: string
  destination: string
  bonus_percentage: number
  link: string
}

interface SyncRequest {
  secret: string
  promotions: Promotion[]
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: SyncRequest = await req.json()
    const { secret, promotions } = body

    const cronSecret = Deno.env.get('CRON_SECRET')

    // Security validation
    if (!cronSecret || secret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase Client with Service Role Key to bypass RLS for inserts/deletes
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Delete all existing records
    const { error: deleteError } = await supabase
      .from('active_promotions')
      .delete()
      .not('id', 'is', null)

    if (deleteError) {
      throw deleteError
    }

    // 2. Insert new records
    if (promotions && promotions.length > 0) {
      const { error: insertError } = await supabase
        .from('active_promotions')
        .insert(promotions)

      if (insertError) {
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ message: 'Promoções sincronizadas com sucesso!' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
