import { NextResponse } from 'next/server';
import { addRestaurant } from '@/lib/db';
import { ExtractedReelData } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { reelUrl, rawText, apiKey, provider } = await req.json();

    if (!reelUrl) {
      return NextResponse.json({ error: 'Reel URL is required' }, { status: 400 });
    }

    let extracted: ExtractedReelData | null = null;
    const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. Try Gemini if configured
    if (activeKey && (provider === 'gemini' || !provider)) {
      try {
        const prompt = `You are a culinary data extractor for Toronto and Waterloo Region.
Extract restaurant information from this Instagram Reel link and text/caption.
Respond STRICTLY with valid JSON following this schema:
{
  "name": "Exact restaurant or cafe name",
  "region": "toronto" | "waterloo" | "mississauga" | "trip",
  "regionName": "City · Neighborhood (e.g. 'Toronto · King West' or 'Waterloo · Uptown')",
  "vibe": "brunch" | "date" | "fine" | "casual" | "drinks",
  "vibeName": "Readable vibe label (e.g. 'Mediterranean Brunch' or 'Michelin & Fine Dining')",
  "badge": "Short catchy badge (e.g. 'Bougie Brunch', 'Steak Legend', 'Hidden Gem')",
  "creator": "Creator handle if mentioned (e.g. '@mattheweats'), or '@instagram'",
  "url": "${reelUrl}",
  "desc": "Short 1-2 sentence description of what the spot is famous for",
  "tip": "Specific signature ordering or timing tip",
  "price": "$" | "$$" | "$$$" | "$$$$",
  "tags": ["array", "of", "relevant", "cuisine", "and", "vibe", "tags"]
}

Reel URL: ${reelUrl}
Caption / Raw text:
${rawText || 'No caption provided'}`;

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
      extracted = heuristicExtract(reelUrl, rawText || '');
    }

    // Save to database
    const saved = await addRestaurant(extracted);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function heuristicExtract(reelUrl: string, text: string): ExtractedReelData {
  const t = text.toLowerCase();
  
  // Detect region
  let region = 'toronto';
  let regionName = 'Toronto · GTA';
  if (t.includes('waterloo') || t.includes('cambridge') || t.includes('kitchener') || t.includes('kw')) {
    region = 'waterloo';
    regionName = t.includes('cambridge') ? 'Cambridge · Waterloo Region' : (t.includes('kitchener') ? 'Kitchener · Core' : 'Waterloo · Uptown');
  } else if (t.includes('mississauga')) {
    region = 'mississauga';
    regionName = 'Mississauga · Streetsville';
  } else if (t.includes('king west')) {
    regionName = 'Toronto · King West';
  } else if (t.includes('yorkville')) {
    regionName = 'Toronto · Yorkville';
  }

  // Detect vibe
  let vibe = 'casual';
  let vibeName = 'Street Food & Casual';
  let badge = 'Foodie Spot';
  let price = '$$';

  if (t.includes('date') || t.includes('romantic') || t.includes('anniversary')) {
    vibe = 'date';
    vibeName = 'Romantic & Date Night';
    badge = 'Date Night Gem';
    price = '$$$';
  } else if (t.includes('brunch') || t.includes('pancake') || t.includes('breakfast') || t.includes('bakery')) {
    vibe = 'brunch';
    vibeName = 'Brunch & Coffee';
    badge = 'Brunch Spot';
    price = '$$';
  } else if (t.includes('michelin') || t.includes('fine dining') || t.includes('steakhouse')) {
    vibe = 'fine';
    vibeName = 'Michelin & Fine Dining';
    badge = 'Fine Dining';
    price = '$$$$';
  } else if (t.includes('cocktail') || t.includes('bar') || t.includes('speakeasy') || t.includes('rooftop')) {
    vibe = 'drinks';
    vibeName = 'Cocktails & Patios';
    badge = 'Craft Cocktails';
    price = '$$$';
  }

  // Detect creator handle
  const creatorMatch = text.match(/@([a-zA-Z0-9_.]+)/);
  const creator = creatorMatch ? `@${creatorMatch[1]}` : '@instagram';

  // Guess name from first line or handle
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name = lines.length > 0 && lines[0].length < 40 ? lines[0] : (creatorMatch ? creatorMatch[1].replace(/[._]/g, ' ') : 'New Food Spot');
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Generate tags
  const tags: string[] = [region, vibe];
  if (t.includes('halal')) tags.push('halal');
  if (t.includes('steak')) tags.push('steak');
  if (t.includes('pasta')) tags.push('italian');
  if (t.includes('cocktails')) tags.push('cocktails');
  if (t.includes('patio')) tags.push('patio');

  return {
    name,
    region,
    regionName,
    vibe,
    vibeName,
    badge,
    creator,
    url: reelUrl,
    desc: lines.slice(0, 2).join(' ') || 'Curated food spot saved from Instagram.',
    tip: 'Try the house specialties and ask about daily specials.',
    price,
    tags
  };
}
