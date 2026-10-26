import { NextResponse } from 'next/server';
import { addRestaurant } from '@/lib/db';
import { ExtractedReelData } from '@/lib/types';
import { verifyAdminPasscode } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { reelUrl, rawText, restaurantName, apiKey, provider, previewOnly } = await req.json();

    if (!reelUrl && !restaurantName) {
      return NextResponse.json({ error: 'Reel URL or Restaurant Name is required' }, { status: 400 });
    }

    let extracted: ExtractedReelData | null = null;
    const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. Try Gemini if configured
    if (activeKey && (provider === 'gemini' || !provider)) {
      try {
        const prompt = `You are a culinary data extractor for Toronto and Waterloo Region.
Extract or enrich restaurant information for this Instagram Reel.
Given:
- Restaurant Name (if known): "${restaurantName || ''}"
- Reel URL: "${reelUrl || ''}"
- Caption / Notes / Transcript:
"${rawText || ''}"

Respond STRICTLY with valid JSON following this schema:
{
  "name": "Exact restaurant or cafe name",
  "region": "toronto" | "waterloo" | "mississauga" | "trip",
  "regionName": "City · Neighborhood (e.g. 'Toronto · King West' or 'Waterloo · Uptown' or 'Cambridge')",
  "vibe": "brunch" | "date" | "fine" | "casual" | "drinks",
  "vibeName": "Readable vibe label (e.g. 'Mediterranean Brunch', 'Romantic & Date Night', 'Michelin & Fine Dining', 'Street Food & Casual', 'Cocktails & Patios')",
  "badge": "Short catchy badge (e.g. 'Bougie Brunch', 'Steak Legend', 'Hidden Gem', 'Late Night Bites')",
  "creator": "Creator handle if mentioned in caption (e.g. '@mattheweats'), or '@instagram'",
  "url": "${reelUrl || ''}",
  "desc": "Short 1-2 sentence description of what the spot is famous for",
  "tip": "Specific signature ordering or timing tip",
  "price": "$" | "$$" | "$$$" | "$$$$",
  "tags": ["array", "of", "relevant", "cuisine", "and", "vibe", "tags"]
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            extracted = JSON.parse(jsonText);
          }
        }
      } catch (e) {
        console.warn('Gemini extraction failed, falling back:', e);
      }
    }

    // 2. Fallback heuristic extractor if LLM is unavailable
    if (!extracted) {
      extracted = heuristicExtract(reelUrl || '', rawText || '', restaurantName || '');
    }

    // If preview only (for auto-filling the form before saving)
    if (previewOnly) {
      return NextResponse.json(extracted);
    }

    // Save to database requires curator admin passcode
    if (!verifyAdminPasscode(req)) {
      return NextResponse.json(
        { error: 'Unauthorized: A curator admin passcode is required to save restaurants to the database.' },
        { status: 401 }
      );
    }

    // Save to database
    const saved = await addRestaurant(extracted);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function heuristicExtract(reelUrl: string, text: string, directName: string): ExtractedReelData {
  const combined = `${directName} ${text}`.toLowerCase();
  
  // Detect region
  let region = 'toronto';
  let regionName = 'Toronto · GTA';
  if (combined.includes('waterloo') || combined.includes('cambridge') || combined.includes('kitchener') || combined.includes('kw')) {
    region = 'waterloo';
    regionName = combined.includes('cambridge') ? 'Cambridge · Waterloo Region' : (combined.includes('kitchener') ? 'Kitchener · Core' : 'Waterloo · Uptown');
  } else if (combined.includes('mississauga')) {
    region = 'mississauga';
    regionName = 'Mississauga · Streetsville';
  } else if (combined.includes('king west')) {
    regionName = 'Toronto · King West';
  } else if (combined.includes('yorkville')) {
    regionName = 'Toronto · Yorkville';
  }

  // Detect vibe
  let vibe = 'casual';
  let vibeName = 'Street Food & Casual';
  let badge = 'Foodie Spot';
  let price = '$$';

  if (combined.includes('date') || combined.includes('romantic') || combined.includes('anniversary')) {
    vibe = 'date';
    vibeName = 'Romantic & Date Night';
    badge = 'Date Night Gem';
    price = '$$$';
  } else if (combined.includes('brunch') || combined.includes('pancake') || combined.includes('breakfast') || combined.includes('bakery')) {
    vibe = 'brunch';
    vibeName = 'Brunch & Coffee';
    badge = 'Brunch Spot';
    price = '$$';
  } else if (combined.includes('michelin') || combined.includes('fine dining') || combined.includes('steakhouse')) {
    vibe = 'fine';
    vibeName = 'Michelin & Fine Dining';
    badge = 'Fine Dining';
    price = '$$$$';
  } else if (combined.includes('cocktail') || combined.includes('bar') || combined.includes('speakeasy') || combined.includes('rooftop')) {
    vibe = 'drinks';
    vibeName = 'Cocktails & Patios';
    badge = 'Craft Cocktails';
    price = '$$$';
  }

  // Detect creator handle
  const creatorMatch = text.match(/@([a-zA-Z0-9_.]+)/);
  const creator = creatorMatch ? `@${creatorMatch[1]}` : '@instagram';

  // Guess name
  let name = directName;
  if (!name) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    name = lines.length > 0 && lines[0].length < 40 ? lines[0] : (creatorMatch ? creatorMatch[1].replace(/[._]/g, ' ') : 'New Food Spot');
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Generate tags
  const tags: string[] = [region, vibe];
  if (combined.includes('halal')) tags.push('halal');
  if (combined.includes('steak')) tags.push('steak');
  if (combined.includes('pasta') || combined.includes('italian')) tags.push('italian');
  if (combined.includes('cocktails')) tags.push('cocktails');
  if (combined.includes('patio')) tags.push('patio');
  if (combined.includes('spicy')) tags.push('spicy');

  return {
    name,
    region,
    regionName,
    vibe,
    vibeName,
    badge,
    creator,
    url: reelUrl,
    desc: text.slice(0, 150) || `Curated ${vibeName.toLowerCase()} spot in ${regionName}.`,
    tip: 'Ask for the chef signature specialties and popular shareables.',
    price,
    tags
  };
}
