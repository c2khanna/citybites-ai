'use client';

import React from 'react';
import { Restaurant } from '@/lib/types';
import { MapPin, Play, Star, CheckCircle2, Bookmark, Lightbulb, Trash2 } from 'lucide-react';

interface RestaurantCardProps {
  spot: Restaurant;
  onUpdateStatus?: (id: string | number, status: 'want_to_go' | 'visited' | 'favorite') => void;
  onDelete?: (id: string | number) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ spot, onUpdateStatus, onDelete }) => {
  const currentStatus = spot.status || 'want_to_go';

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-orange-500/50 hover:shadow-xl transition-all duration-200 group relative">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
            {spot.badge}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-400" /> {spot.regionName}
            </span>
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove "${spot.name}" from your catalog?`)) {
                    onDelete(spot.id);
                  }
                }}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer opacity-30 group-hover:opacity-100"
                title="Delete restaurant"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Vibe */}
        <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
          {spot.name}
        </h3>
        <p className="text-xs font-medium text-blue-400 mt-0.5">
          {spot.vibeName} · <span className="text-slate-400 font-semibold">{spot.price}</span>
        </p>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
          {spot.desc}
        </p>

        {/* Pro Tip */}
        {spot.tip && (
          <div className="text-xs text-amber-300/90 mt-2.5 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong className="text-amber-200">Tip:</strong> {spot.tip}</span>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--border)] space-y-3">
        {/* Status Tracker Buttons */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">My List:</span>
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onUpdateStatus?.(spot.id, 'want_to_go')}
              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition cursor-pointer ${
                currentStatus === 'want_to_go' ? 'bg-orange-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Want to Visit"
            >
              <Bookmark className="w-3 h-3" /> Want to Go
            </button>
            <button
              onClick={() => onUpdateStatus?.(spot.id, 'visited')}
              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition cursor-pointer ${
                currentStatus === 'visited' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Visited"
            >
              <CheckCircle2 className="w-3 h-3" /> Visited
            </button>
            <button
              onClick={() => onUpdateStatus?.(spot.id, 'favorite')}
              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 transition cursor-pointer ${
                currentStatus === 'favorite' ? 'bg-amber-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Favorite"
            >
              <Star className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400 italic">{spot.creator}</span>
          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.regionName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--background)] hover:bg-slate-700 text-slate-200 transition flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-red-400" /> Maps
            </a>
            <a
              href={spot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition flex items-center gap-1 shadow"
            >
              <Play className="w-3 h-3 fill-current" /> Reel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
