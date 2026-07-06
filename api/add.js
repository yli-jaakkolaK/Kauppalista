const SUPABASE_URL = 'https://uctmxxeewoeydabuepye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG14eGVld29leWRhYnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI1NDYsImV4cCI6MjA5ODQ5ODU0Nn0.oJLbtc2BDTqwKu-Ih8ahZMM-s-XpqGvULV5ENGhDYJU';

async function haeKauppalistaId() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/lists?name=eq.Kauppalista&select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  const lists = await response.json();
  return lists[0] ? lists[0].id : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nimi } = req.body;

  if (!nimi) {
    return res.status(400).json({ error: 'nimi is required' });
  }

  const listId = await haeKauppalistaId();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/tuotteet`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ nimi, tehty: false, list_id: listId }),
  });

  if (!response.ok) {
    return res.status(500).json({ error: 'Failed to insert' });
  }

  const [inserted] = await response.json();

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: null,
        action: 'added',
        target_type: 'item',
        target_id: inserted ? String(inserted.id) : null,
        target_name: nimi,
        list_id: listId,
      }),
    });
  } catch (e) {
    // lokitus ei saa koskaan kaataa Siri-lisäystä
  }

  return res.status(200).json({ success: true });
};
