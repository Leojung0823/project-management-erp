// Trello due reminder Edge Function draft.
// Deploy after the project has real users and a configured email/push provider.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !key) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing runtime configuration' }), { status: 500 });
  }

  const supabase = createClient(url, key);
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('trello_due_notifications')
    .select('*')
    .lte('due_date', today)
    .is('sent_at', null)
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

  const ids = (data ?? []).map((item) => item.id);
  if (ids.length) {
    await supabase
      .from('trello_due_notifications')
      .update({ sent_at: new Date().toISOString() })
      .in('id', ids);
  }

  return new Response(JSON.stringify({ ok: true, checked: data?.length ?? 0, marked_sent: ids.length }), {
    headers: { 'content-type': 'application/json' }
  });
});
