// Supabase Edge Function — envía push notification al compañero
// Deploy: supabase functions deploy send-push

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { hogar_id, exclude_id, titulo, cuerpo } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Obtiene el push token del compañero
    const { data: compañero } = await supabase
      .from('perfiles')
      .select('push_token')
      .eq('hogar_id', hogar_id)
      .neq('id', exclude_id)
      .not('push_token', 'is', null)
      .single();

    if (!compañero?.push_token) {
      return new Response(JSON.stringify({ ok: true, msg: 'no token' }), { status: 200 });
    }

    // Envía la notificación vía Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: compañero.push_token,
        title: titulo,
        body: cuerpo,
        sound: 'default',
        priority: 'high',
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify({ ok: true, result }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
