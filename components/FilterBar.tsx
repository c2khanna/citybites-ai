'use client';

import React from 'react';
import { Search, MapPin, Sparkles, Bookmark, CheckCircle2, Star } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedRegion: string;
  onRegionChange: (val: string) => void;
  selectedVibe: string;
  onVibeChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedVibe,
  onVibeChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const regions = [
    { id: 'all', label: 'All Regions' },
    { id: 'toronto', label: '🍁 Toronto' },
    { id: 'waterloo', label: '🦆 Waterloo / KW' },
    { id: 'mississauga', label: '🏙️ Mississauga' },
    { id: 'trip', label: '🌍 Beyond' },
  ];

  const vibes = [
    { id: 'all', label: 'All Vibes' },
    { id: 'date', label: '🥂 Date Night' },
    { id: 'brunch', label: '🍳 Brunch' },
    { id: 'fine', label: '⭐ Michelin / Fine' },
    { id: 'casual', label: '🌯 Street Food' },
    { id: 'drinks', label: '🍸 Cocktails' },
  ];

  const statuses = [
    { id: 'all', label: 'All Spots' },
    { id: 'want_to_go', label: '📌 Want to Go', icon: Bookmark },
    { id: 'visited', label: '✅ Visited', icon: CheckCircle2 },
    { id: 'favorite', label: '⭐ Favorites', icon: Star },
  ];

  return (
    <div className="bg-[var(--card)] p-4 md:p-5 rounded-2xl border border-[var(--border)] space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter catalog by name, cuisine, neighborhood, or creator..."
          className="w-full px-4 py-3 pl-11 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />
        <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[var(--muted-foreground)]" />
      </div>

      {/* Status Filter Tabs (Bucket List) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
        {statuses.map(st => (
          <button
            key={st.id}
            onClick={() => onStatusChange(st.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === st.id
                ? 'bg-orange-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Region Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">
          Region:
        </span>
        {regions.map(r => (
          <button
            key={r.id}
            onClick={() => onRegionChange(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer ${
              selectedRegion === r.id
                ? 'bg-orange-500 text-white font-semibold'
                : 'bg-[var(--background)] hover:bg-slate-800 text-[var(--muted-foreground)]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Vibe Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mr-1">
          Vibe:
        </span>
        {vibes.map(v => (
          <button
            key={v.id}
            onClick={() => onVibeChange(v.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer ${
              selectedVibe === v.id
                ? 'bg-blue-500 text-white font-semibold'
                : 'bg-[var(--background)] hover:bg-slate-800 text-[var(--muted-foreground)]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-[var(--muted-foreground)]">
          Showing {filteredCount} of {totalCount} spots
        </p>
        <button
          onClick={onReset}
          className="text-xs text-orange-400 hover:underline cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};
