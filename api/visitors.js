import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: fetchError } = await supabase
      .from('visitors')
      .select('*')
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'Database error' });
    }

    let visitorCount;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('visitors')
        .update({ count: existing.count + 1 })
        .eq('date', today)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return res.status(500).json({ error: 'Failed to update count' });
      }

      visitorCount = updated.count;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('visitors')
        .insert([{ date: today, count: 1 }])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return res.status(500).json({ error: 'Failed to create record' });
      }

      visitorCount = inserted.count;
    }

    return res.status(200).json({
      value: visitorCount,
      date: today,
      label: "Today's Visitors",
    });
  } catch (err) {
    console.error('Visitor handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
