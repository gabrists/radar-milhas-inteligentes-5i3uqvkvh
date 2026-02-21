import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({ message: 'Functions placeholder' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
