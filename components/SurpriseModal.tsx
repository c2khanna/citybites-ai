'use client';

import React from 'react';
import { Restaurant } from '@/lib/types';
import { X, Play, MapPin } from 'lucide-react';

interface SurpriseModalProps {
  spot: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SurpriseModal: React.FC<SurpriseModalProps> = ({ spot, isOpen, onClose }) => {
  if (!isOpen || !spot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-950/40 via-[var(--card)] to-[var(--card)] border-2 border-orange-500/80 shadow-2xl relative max-w-lg w-full">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-orange-500 text-white uppercase tracking-wider">
              Tonight's Pick!
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{spot.name}</h2>
            <p className="text-xs text-orange-300 font-medium">
              {spot.regionName} · {spot.vibeName} · {spot.price}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-200 mt-3 leading-relaxed">
          {spot.desc} {spot.tip ? `Tip: ${spot.tip}` : ''}
        </p>

        <div className="flex gap-3 mt-5">
          <a
            href={spot.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition flex items-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Watch Instagram Reel
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.regionName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" /> Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};
