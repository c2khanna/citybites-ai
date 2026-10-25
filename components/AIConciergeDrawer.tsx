'use client';

import React, { useState } from 'react';
import { Restaurant, AIConciergeResponse } from '@/lib/types';
import { Sparkles, MessageSquare, Loader2, Lightbulb, MapPin, Play } from 'lucide-react';

interface AIConciergeDrawerProps {
  spots: Restaurant[];
}

export const AIConciergeDrawer: React.FC<AIConciergeDrawerProps> = ({ spots }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIConciergeResponse | null>(null);

  const quickPrompts = [
    '🥂 Anniversary steak dinner in Toronto',
    '🥞 Waterloo / Cambridge brunch with pastries',
    '🌯 Late night street comfort food & shawarma',
    '🍸 Trendy speakeasy cocktail lounge',
  ];

  async function handleAsk(promptToAsk?: string) {
    const q = promptToAsk || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Check if user has client-side api key stored in localStorage
      let apiKey = '';
      let provider = 'local';
      try {
        const config = localStorage.getItem('citybites_ai_config');
        if (config) {
          const parsed = JSON.parse(config);
          apiKey = parsed.apiKey || '';
          provider = parsed.provider || 'local';
        }
      } catch (e) {}

      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, apiKey, provider }),
      });

      if (!res.ok) throw new Error('Concierge request failed');
      const data: AIConciergeResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        recommendation: `Could not reach live concierge, but we have incredible spots in your catalog like ${spots[0]?.name || 'Casa Madera'}!`,
        primary_spot_id: spots[0]?.id,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const primarySpot = spots.find(s => String(s.id) === String(result?.primary_spot_id)) || spots[0];
  const secondarySpots = (result?.secondary_spot_ids || [])
    .map(id => spots.find(s => String(s.id) === String(id)))
    .filter(Boolean) as Restaurant[];

  return (
    <section id="aiSection" className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[var(--card)] to-[var(--card)] border border-purple-500/30 shadow-xl relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI Restaurant Concierge
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">Natural Language Recommendation</span>
      </div>

      <p className="text-sm text-slate-300 mb-4">
        Tell me what you're craving, who you're with, or the vibe you want. The concierge will evaluate location, cuisine, and ambiance from your saved reels:
      </p>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g., 'Romantic anniversary dinner in Toronto with great steak' or 'Fun brunch in Waterloo'..."
            className="w-full px-4 py-3 pl-10 rounded-xl bg-[var(--background)] border border-purple-500/30 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <MessageSquare className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span>Analyzing...</span>
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <span>Ask Concierge</span>
          )}
        </button>
      </form>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 custom-scroll text-xs">
        <span className="text-slate-400 whitespace-nowrap">Try asking:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(p);
              handleAsk(p);
            }}
            className="px-3 py-1 rounded-full bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 whitespace-nowrap transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Results Box */}
      {result && (
        <div className="mt-5 pt-4 border-t border-purple-500/30 space-y-4">
          {result.thought && (
            <div className="text-xs bg-purple-950/30 p-3 rounded-xl border border-purple-500/20 text-purple-300 font-mono text-[11px] leading-relaxed">
              <strong className="text-purple-200">🧠 Reasoning: </strong> {result.thought}
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm shrink-0 shadow">🤖</div>
            <div className="flex-1">
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {result.recommendation}
              </p>
              {result.pro_tip && (
                <p className="text-xs text-amber-300 font-medium mt-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Pro-tip: {result.pro_tip}
                </p>
              )}
            </div>
          </div>

          {/* Recommended Card Highlight */}
          {primarySpot && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      {primarySpot.name}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40">
                        Top Pick
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {primarySpot.regionName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{primarySpot.desc}</p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-purple-500/20">
                  <span className="text-xs font-semibold text-amber-300">{primarySpot.price}</span>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primarySpot.name + ' ' + primarySpot.regionName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Maps
                    </a>
                    <a
                      href={primarySpot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-1 shadow"
                    >
                      <Play className="w-3 h-3 fill-current" /> Reel
                    </a>
                  </div>
                </div>
              </div>

              {secondarySpots[0] && (
                <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        {secondarySpots[0].name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40">
                          Alternative
                        </span>
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {secondarySpots[0].regionName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{secondarySpots[0].desc}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-purple-500/20">
                    <span className="text-xs font-semibold text-amber-300">{secondarySpots[0].price}</span>
                    <div className="flex gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(secondarySpots[0].name + ' ' + secondarySpots[0].regionName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      >
                        Maps
                      </a>
                      <a
                        href={secondarySpots[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-1 shadow"
                      >
                        <Play className="w-3 h-3 fill-current" /> Reel
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
