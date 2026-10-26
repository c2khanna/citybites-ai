import fs from 'fs';
import path from 'path';
import { Restaurant, ExtractedReelData } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'restaurants.json');

// Helper to read local JSON
function readLocalRestaurants(): Restaurant[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local restaurants.json:', err);
    return [];
  }
}

// Helper to write local JSON
function writeLocalRestaurants(spots: Restaurant[]): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(spots, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local restaurants.json:', err);
  }
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((r: any) => ({
          id: r.id,
          name: r.name,
          region: r.region,
          regionName: r.region_name,
          vibe: r.vibe,
          vibeName: r.vibe_name,
          badge: r.badge,
          creator: r.creator,
          url: r.reel_url,
          desc: r.description,
          tip: r.pro_tip,
          price: r.price_tier,
          tags: r.tags || [],
          status: r.status || 'want_to_go',
          userNotes: r.personal_notes,
          userRating: r.rating,
          createdAt: r.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to local database:', err);
    }
  }

  return readLocalRestaurants();
}

export async function addRestaurant(newSpot: ExtractedReelData): Promise<Restaurant> {
  const spot: Restaurant = {
    id: Date.now(),
    name: newSpot.name,
    region: newSpot.region,
    regionName: newSpot.regionName,
    vibe: newSpot.vibe,
    vibeName: newSpot.vibeName,
    badge: newSpot.badge || 'New Spot',
    creator: newSpot.creator || '@instagram',
    url: newSpot.url,
    desc: newSpot.desc,
    tip: newSpot.tip,
    price: newSpot.price || '$$',
    tags: newSpot.tags || [],
    status: 'want_to_go',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          name: spot.name,
          region: spot.region,
          region_name: spot.regionName,
          vibe: spot.vibe,
          vibe_name: spot.vibeName,
          badge: spot.badge,
          creator: spot.creator,
          reel_url: spot.url,
          description: spot.desc,
          pro_tip: spot.tip,
          price_tier: spot.price,
          tags: spot.tags,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          ...spot,
          id: data.id,
        };
      }
    } catch (err) {
      console.warn('Supabase insert failed, saving to local file:', err);
    }
  }

  // Local file persistence
  const current = readLocalRestaurants();
  const updated = [spot, ...current];
  writeLocalRestaurants(updated);
  return spot;
}

export async function updateRestaurantStatus(
  id: string | number,
  updates: { status?: 'want_to_go' | 'visited' | 'favorite'; userNotes?: string; userRating?: number }
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          status: updates.status,
          personal_notes: updates.userNotes,
          rating: updates.userRating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('Supabase update failed, updating local file:', err);
    }
  }

  const current = readLocalRestaurants();
  const index = current.findIndex(s => String(s.id) === String(id));
  if (index !== -1) {
    current[index] = { ...current[index], ...updates };
    writeLocalRestaurants(current);
    return true;
  }
  return false;
}

export async function deleteRestaurant(id: string | number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (!error) return true;
      console.warn('Supabase delete error:', error.message);
    } catch (err) {
      console.warn('Supabase delete failed, falling back to local file:', err);
    }
  }

  const current = readLocalRestaurants();
  const filtered = current.filter(s => String(s.id) !== String(id));
  if (filtered.length !== current.length) {
    writeLocalRestaurants(filtered);
    return true;
  }
  return false;
}
