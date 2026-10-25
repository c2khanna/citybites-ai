'use client';

import React, { useState } from 'react';
import { ExtractedReelData, Restaurant } from '@/lib/types';
import { Sparkles, X, PlusCircle, Loader2 } from 'lucide-react';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotAdded: (spot: Restaurant) => void;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({ isOpen, onClose, onSpotAdded }) => {
  const [reelUrl, setReelUrl] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<Partial<ExtractedReelData>>({
    name: '',
    region: 'toronto',
    regionName: 'Toronto · King West',
    vibe: 'brunch',
    vibeName: 'Brunch & Cocktails',
    badge: 'Bougie Brunch',
    desc: '',
    tip: '',
    price: '$$',
    creator: '@instagram',
  });

  if (!isOpen) return null;

  async function handleAIExtract() {
    if (!reelUrl) {
      setError('Please paste an Instagram Reel URL first');
      return;
    }
    setError(null);
    setIsExtracting(true);

    try {
      const res = await fetch('/api/ai/extract-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelUrl,
          rawText: captionText,
        }),
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data: Restaurant = await res.json();
      
      onSpotAdded(data);
      onClose();
      // Reset
      setReelUrl('');
      setCaptionText('');
    } catch (err: any) {
      setError(err.message || 'Failed to auto-extract with AI');
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    if (!reelUrl || !formData.name) {
      setError('Reel URL and Restaurant Name are required');
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      const payload: ExtractedReelData = {
        name: formData.name || 'New Spot',
        region: formData.region || 'toronto',
        regionName: formData.regionName || 'Toronto · GTA',
        vibe: formData.vibe || 'casual',
        vibeName: formData.vibeName || 'Street Food & Casual',
        badge: formData.badge || 'New Spot',
        creator: formData.creator || '@instagram',
        url: reelUrl,
        desc: formData.desc || 'Curated food spot from Instagram.',
        tip: formData.tip || '',
        price: formData.price || '$$',
        tags: [formData.region || 'toronto', formData.vibe || 'casual'],
      };

      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save spot');
      const created = await res.json();
      onSpotAdded(created);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Add New Food Reel</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-300 font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Instagram Reel Link & Caption */}
        <div className="space-y-3 bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Instagram Reel URL:
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              value={reelUrl}
              onChange={e => setReelUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Caption / Creator Notes (Optional):
            </label>
            <textarea
              placeholder="Paste the caption or video transcript to let the AI auto-extract location, dishes, and insider tips..."
              rows={3}
              value={captionText}
              onChange={e => setCaptionText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAIExtract}
            disabled={isExtracting || !reelUrl}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Analyzing & Auto-Filling...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ 1-Click Auto-Extract & Save with AI</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider">or customize manually</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        {/* Manual Form Customizer */}
        <form onSubmit={handleManualSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Restaurant Name</label>
              <input
                type="text"
                placeholder="e.g. Casa Madera"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Price Tier</label>
              <select
                value={formData.price || '$$'}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
              >
                <option value="$">$ (Under $15)</option>
                <option value="$$">$$ ($15 - $35)</option>
                <option value="$$$">$$$ ($35 - $75)</option>
                <option value="$$$$">$$$$ (Fine Dining)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Region</label>
              <select
                value={formData.region || 'toronto'}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
              >
                <option value="toronto">Toronto</option>
                <option value="waterloo">Waterloo / Cambridge / Kitchener</option>
                <option value="mississauga">Mississauga</option>
                <option value="trip">Beyond</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Vibe</label>
              <select
                value={formData.vibe || 'casual'}
                onChange={e => setFormData({ ...formData, vibe: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
              >
                <option value="brunch">Brunch & Coffee</option>
                <option value="date">Romantic & Date Night</option>
                <option value="fine">Michelin & Fine Dining</option>
                <option value="casual">Street Food & Casual</option>
                <option value="drinks">Cocktails & Patios</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Pro-Tip / Signature Order</label>
            <input
              type="text"
              placeholder="e.g. Order the tableside caesar salad"
              value={formData.tip || ''}
              onChange={e => setFormData({ ...formData, tip: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              {isSaving ? 'Saving...' : 'Save to Catalog'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
