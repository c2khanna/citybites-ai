import { NextResponse } from 'next/server';
import { getAllRestaurants } from '@/lib/db';
import { AIConciergeResponse } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { query, apiKey, provider } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const spots = await getAllRestaurants();
    const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. Try Gemini Live RAG if configured
    if (activeKey && (provider === 'gemini' || !provider)) {
      try {
        const prompt = `You are CityBites AI, an expert culinary concierge for Toronto and Waterloo Region.
You are given a database of restaurants from saved Instagram reels.
Your task is to analyze the user's request (craving, vibe, location, dietary constraints) and recommend the best spot(s).
Respond STRICTLY with valid JSON following this schema:
{
  "thought": "Your concise step-by-step reasoning about matching location, vibe, and dishes",
  "primary_spot_id": <id of best restaurant>,
  "secondary_spot_ids": [<array of alternative ids>],
  "recommendation": "<conversational explanation of why this spot fits the request>",
  "pro_tip": "<specific signature ordering or timing advice>",
  "vibe_match": "High" | "Perfect" | "Good"
}

Catalog:
${JSON.stringify(spots.map(s => ({
  id: s.id,
  name: s.name,
  regionName: s.regionName,
  vibeName: s.vibeName,
  price: s.price,
  desc: s.desc,
  tip: s.tip,
  tags: s.tags
})))}

User Query: "${query}"`;

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
            const parsed = JSON.parse(jsonText);
            return NextResponse.json(parsed);
          }
        }
      } catch (e) {
        console.warn('Gemini concierge query failed, falling back:', e);
      }
    }

    // 2. Semantic scoring fallback
    const result = evaluateSemanticFallback(query, spots);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function evaluateSemanticFallback(query: string, spots: any[]): AIConciergeResponse {
  const q = query.toLowerCase();

  const scored = spots.map(spot => {
    let score = 0;
    let reasons: string[] = [];

    if (q.includes('waterloo') && (spot.region === 'waterloo' || spot.regionName.toLowerCase().includes('waterloo'))) {
      score += 15; reasons.push('in Waterloo Region');
    }
    if (q.includes('cambridge') && spot.regionName.toLowerCase().includes('cambridge')) {
      score += 20; reasons.push('in Cambridge');
    }
    if (q.includes('kitchener') && spot.regionName.toLowerCase().includes('kitchener')) {
      score += 20; reasons.push('in Kitchener');
    }
    if (q.includes('toronto') && spot.region === 'toronto') {
      score += 10; reasons.push('in Toronto');
    }
    if (q.includes('king west') && spot.regionName.toLowerCase().includes('king west')) {
      score += 15; reasons.push('on King West');
    }
    if (q.includes('yorkville') && spot.regionName.toLowerCase().includes('yorkville')) {
      score += 20; reasons.push('in Yorkville');
    }

    if ((q.includes('romantic') || q.includes('date') || q.includes('anniversary')) && (spot.vibe === 'date' || spot.tags.includes('romantic'))) {
      score += 20; reasons.push('romantic date night vibe');
    }
    if ((q.includes('brunch') || q.includes('pancake') || q.includes('breakfast')) && spot.vibe === 'brunch') {
      score += 20; reasons.push('superb brunch spot');
    }
    if ((q.includes('steak') || q.includes('beef')) && spot.tags.includes('steak')) {
      score += 25; reasons.push('renowned steaks');
    }
    if (q.includes('halal') && spot.tags.includes('halal')) {
      score += 25; reasons.push('halal certified');
    }
    if ((q.includes('cocktail') || q.includes('drinks') || q.includes('speakeasy')) && (spot.vibe === 'drinks' || spot.tags.includes('cocktails'))) {
      score += 20; reasons.push('craft cocktails');
    }
    if ((q.includes('michelin') || q.includes('fine dining')) && spot.vibe === 'fine') {
      score += 20; reasons.push('fine dining caliber');
    }
    if ((q.includes('casual') || q.includes('cheap') || q.includes('street') || q.includes('shawarma') || q.includes('momo')) && spot.vibe === 'casual') {
      score += 18; reasons.push('comfort street food');
    }

    spot.tags.forEach((t: string) => {
      if (q.includes(t)) score += 5;
    });

    return { spot, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.spot || spots[0];
  const secondaries = scored.slice(1, 3).map(s => s.spot.id);

  return {
    thought: `Evaluated ${spots.length} spots against keyword vectors. Matched criteria: [${scored[0]?.reasons.join(', ') || 'General recommendation'}].`,
    primary_spot_id: best.id,
    secondary_spot_ids: secondaries,
    recommendation: `Based on your request, I recommend ${best.name} (${best.regionName}). ${best.desc}`,
    pro_tip: best.tip,
    vibe_match: scored[0]?.score > 15 ? 'Perfect' : 'High'
  };
}
