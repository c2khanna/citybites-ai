'use client';

import React, { useState } from 'react';
import { ExtractedReelData, Restaurant } from '@/lib/types';
import { Sparkles, X, PlusCircle, Loader2, CheckCircle, HelpCircle } from 'lucide-react';

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
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
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
    if (!reelUrl && !formData.name) {
      setError('Please paste an Instagram Reel URL or type the Restaurant Name first');
      return;
    }
    setError(null);
    setSuccessNotice(null);
    setIsExtracting(true);

    try {
      // Get API key from localStorage if configured
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

      const res = await fetch('/api/ai/extract-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reelUrl,
          rawText: captionText,
          restaurantName: formData.name,
          apiKey,
          provider,
          previewOnly: true, // Only preview to allow user review
        }),
      });

      if (!res.ok) throw new Error('Auto-fill request failed');
      const data: ExtractedReelData = await res.json();
      
      setFormData(data);
      setSuccessNotice('✨ AI successfully auto-filled the fields! Review and click "Save to Catalog" below.');
    } catch (err: any) {
      setError(err.message || 'Failed to auto-extract with AI');
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    if (!reelUrl || !formData.name) {
      setError('Both Reel URL and Restaurant Name are required');
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

      if (!res.ok) throw new Error('Failed to save spot to database');
      const created = await res.json();
      onSpotAdded(created);
      onClose();
      // Reset
      setReelUrl('');
      setCaptionText('');
      setSuccessNotice(null);
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

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Caption or Notes (Recommended):
              </label>
              <span className="text-[10px] text-slate-400">Copy & paste video caption</span>
            </div>
            <textarea
              placeholder="Paste the caption or video text here (e.g. 'Must-try burger spot in Waterloo at...') so the AI can extract dishes, vibe, and location!"
              rows={3}
              value={captionText}
              onChange={e => setCaptionText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Instagram blocks public servers from reading private links, so pasting the caption gives you 100% accurate AI extraction!</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAIExtract}
            disabled={isExtracting || (!reelUrl && !formData.name)}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Analyzing & Auto-Filling Fields...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Auto-Fill Details with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Review & Edit Form */}
        <form onSubmit={handleManualSave} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Restaurant Name *</label>
              <input
                type="text"
                placeholder="e.g. Casa Madera"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
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
            <label className="text-xs text-slate-300 block mb-1">Neighborhood / Region Name</label>
            <input
              type="text"
              placeholder="e.g. Toronto · King West or Waterloo · Uptown"
              value={formData.regionName || ''}
              onChange={e => setFormData({ ...formData, regionName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Pro-Tip / What to Order</label>
            <input
              type="text"
              placeholder="e.g. Order the tableside caesar salad or book 2 weeks ahead"
              value={formData.tip || ''}
              onChange={e => setFormData({ ...formData, tip: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Short Description</label>
            <textarea
              rows={2}
              placeholder="Short description of the food & atmosphere..."
              value={formData.desc || ''}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>Save to Catalog</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
