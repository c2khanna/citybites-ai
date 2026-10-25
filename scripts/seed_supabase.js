const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !secretKey) {
  console.error('Error: Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment or .env.local');
  process.exit(1);
}

const supabase = createClient(url, secretKey);

async function seed() {
  const filePath = path.join(__dirname, '..', 'data', 'restaurants.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const spots = JSON.parse(rawData);

  console.log(`Seeding ${spots.length} restaurants to Supabase...`);

  for (const s of spots) {
    const payload = {
      name: s.name,
      region: s.region,
      region_name: s.regionName,
      vibe: s.vibe,
      vibe_name: s.vibeName,
      badge: s.badge,
      creator: s.creator,
      reel_url: s.url,
      description: s.desc,
      pro_tip: s.tip,
      price_tier: s.price,
      tags: s.tags || [],
      status: 'want_to_go',
    };

    const { error } = await supabase
      .from('restaurants')
      .upsert(payload, { onConflict: 'reel_url' })
      .select();

    if (error) {
      console.error(`Error inserting ${s.name}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${s.name}`);
    }
  }

  console.log('Seeding complete!');
}

seed();
