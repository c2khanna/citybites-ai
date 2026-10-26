'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterBar } from '@/components/FilterBar';
import { AIConciergeDrawer } from '@/components/AIConciergeDrawer';
import { AddSpotModal } from '@/components/AddSpotModal';
import { SurpriseModal } from '@/components/SurpriseModal';
import { Sparkles, Dices, PlusCircle, Loader2, Lock, Unlock } from 'lucide-react';

export default function HomePage() {
  const [spots, setSpots] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCuratorUnlocked, setIsCuratorUnlocked] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [vibe, setVibe] = useState('all');
  const [status, setStatus] = useState('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [surpriseSpot, setSurpriseSpot] = useState<Restaurant | null>(null);

  // Load spots from backend API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/restaurants');
        if (res.ok) {
          const data = await res.json();
          setSpots(data);
        }
      } catch (err) {
        console.error('Failed to load restaurants', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();

    try {
      const savedKey = localStorage.getItem('citybites_curator_key');
      setIsCuratorUnlocked(Boolean(savedKey));
    } catch (e) {}
  }, []);

  function handleCuratorLoginToggle() {
    const current = localStorage.getItem('citybites_curator_key') || '';
    const input = window.prompt(
      'Enter Curator Passcode (allows adding & deleting spots):',
      current
    );
    if (input !== null) {
      if (input.trim()) {
        localStorage.setItem('citybites_curator_key', input.trim());
        setIsCuratorUnlocked(true);
        alert('🔓 Curator mode unlocked! You can now add and delete spots.');
      } else {
        localStorage.removeItem('citybites_curator_key');
        setIsCuratorUnlocked(false);
        alert('🔒 Curator mode locked.');
      }
    }
  }

  // Update status handler
  async function handleUpdateStatus(id: string | number, newStatus: 'want_to_go' | 'visited' | 'favorite') {
    // Optimistic UI update
    setSpots(prev => prev.map(s => String(s.id) === String(id) ? { ...s, status: newStatus } : s));

    try {
      const curatorKey = localStorage.getItem('citybites_curator_key') || '';
      await fetch(`/api/restaurants/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': curatorKey,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to update status', e);
    }
  }

  // Delete handler with interactive passcode prompt if missing
  async function handleDeleteSpot(id: string | number) {
    const previous = spots;
    let curatorKey = '';
    try {
      curatorKey = localStorage.getItem('citybites_curator_key') || '';
    } catch (e) {}

    // If no key saved yet, prompt the user right here
    if (!curatorKey) {
      const input = window.prompt('🔒 Enter Curator Passcode to confirm deletion:');
      if (!input || !input.trim()) return; // User cancelled
      curatorKey = input.trim();
      localStorage.setItem('citybites_curator_key', curatorKey);
      setIsCuratorUnlocked(true);
    }

    // Optimistic removal
    setSpots(prev => prev.filter(s => String(s.id) !== String(id)));

    try {
      let res = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': curatorKey,
        },
      });

      if (res.status === 401) {
        const retry = window.prompt('🔒 Passcode incorrect. Please re-enter your valid Curator Passcode:');
        if (retry && retry.trim()) {
          curatorKey = retry.trim();
          localStorage.setItem('citybites_curator_key', curatorKey);
          setIsCuratorUnlocked(true);

          res = await fetch(`/api/restaurants/${id}`, {
            method: 'DELETE',
            headers: {
              'x-admin-passcode': curatorKey,
            },
          });

          if (res.ok) return; // Succeeded on retry
        }

        alert('🔒 Unauthorized: Missing or invalid curator passcode.');
        setSpots(previous); // Revert
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to delete spot from database');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete spot');
      setSpots(previous); // Revert
    }
  }

  // Spot added callback
  function handleSpotAdded(newSpot: Restaurant) {
    setSpots(prev => [newSpot, ...prev]);
  }

  // Filter spots
  const filteredSpots = spots.filter(s => {
    const sRegion = s.region?.toLowerCase() || '';
    const sVibe = s.vibe?.toLowerCase() || '';
    const sStatus = s.status || 'want_to_go';
    const q = search.toLowerCase().trim();

    const matchesRegion = region === 'all' || sRegion === region;
    const matchesVibe = vibe === 'all' || sVibe === vibe;
    const matchesStatus = status === 'all' || sStatus === status;
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.regionName.toLowerCase().includes(q) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));

    return matchesRegion && matchesVibe && matchesStatus && matchesSearch;
  });

  function pickSurprise() {
    const pool = filteredSpots.length > 0 ? filteredSpots : spots;
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseSpot(random);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">✨</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              CityBites <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">AI</span>
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
              Full-Stack Edition
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Your personal culinary concierge and reel ingestion engine for Toronto, Waterloo Region & beyond.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Curator Login/Status Button */}
          <button
            onClick={handleCuratorLoginToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isCuratorUnlocked
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-[var(--card)] text-slate-300 border-[var(--border)] hover:bg-slate-800'
            }`}
            title="Curator Passcode Settings"
          >
            {isCuratorUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isCuratorUnlocked ? 'Curator Unlocked' : 'Curator Login'}</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Food Reel
          </button>
          
          <button
            onClick={() => {
              const el = document.getElementById('aiSection');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask Concierge
          </button>
          
          <button
            onClick={pickSurprise}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[var(--card)] hover:bg-slate-800 border border-[var(--border)] transition cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" /> Surprise Me!
          </button>
        </div>
      </header>

      {/* AI Concierge Section */}
      <AIConciergeDrawer spots={spots} />

      {/* Filter & Bucket List Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedRegion={region}
        onRegionChange={setRegion}
        selectedVibe={vibe}
        onVibeChange={setVibe}
        selectedStatus={status}
        onStatusChange={setStatus}
        totalCount={spots.length}
        filteredCount={filteredSpots.length}
        onReset={() => {
          setSearch('');
          setRegion('all');
          setVibe('all');
          setStatus('all');
        }}
      />

      {/* Spots Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm font-medium">Connecting to database...</p>
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="py-20 text-center text-[var(--muted-foreground)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-medium">No spots match your active filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setRegion('all');
              setVibe('all');
              setStatus('all');
            }}
            className="mt-3 text-xs text-orange-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpots.map(spot => (
            <RestaurantCard
              key={spot.id}
              spot={spot}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteSpot}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddSpotModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSpotAdded={handleSpotAdded}
      />

      <SurpriseModal
        spot={surpriseSpot}
        isOpen={Boolean(surpriseSpot)}
        onClose={() => setSurpriseSpot(null)}
      />

    </div>
  );
}
