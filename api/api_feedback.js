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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase GET error:', error);
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error('GET handler error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, comment, rating } = req.body;

      if (!comment || !comment.trim()) {
        return res.status(400).json({ error: 'Comment is required' });
      }
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const newFeedback = {
        name: name?.trim() || 'Anonymous',
        message: comment.trim(),
        rating: parseInt(rating),
      };

      const { data, error } = await supabase
        .from('feedback')
        .insert([newFeedback])
        .select();

      if (error) {
        console.error('Supabase INSERT error:', error);
        return res.status(500).json({ error: 'Failed to save feedback' });
      }

      const { data: allFeedback, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Supabase FETCH error:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch updated feedback' });
      }

      return res.status(200).json({
        success: true,
        feedback: data[0],
        allFeedback,
      });
    } catch (err) {
      console.error('POST handler error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
