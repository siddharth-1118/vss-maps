import React, { useState } from 'react';
import {
  Utensils,
  Coffee,
  Fuel,
  DollarSign,
  Hospital,
  Home,
  ShoppingBag,
  Car,
  Search,
  ExternalLink,
  MapPin,
  Sparkles,
} from './Icons';
import { fetchNearbyPois, type PoiCategory, type PoiResult } from '../services/overpass';

interface NearbyPoiPanelProps {
  mapCenter: [number, number];
  onFlyToPoi: (poi: PoiResult) => void;
  onSelectPoisForMap: (pois: PoiResult[]) => void;
}

const CATEGORIES: { id: PoiCategory; label: string; icon: React.ReactNode; gradient: string; glow: string }[] = [
  { id: 'restaurant', label: 'Restaurants', icon: <Utensils className="w-4 h-4" />, gradient: 'from-amber-500/20 to-orange-500/20', glow: 'text-amber-400' },
  { id: 'cafe', label: 'Cafes', icon: <Coffee className="w-4 h-4" />, gradient: 'from-orange-500/20 to-red-500/20', glow: 'text-orange-400' },
  { id: 'fuel', label: 'Gas Stations', icon: <Fuel className="w-4 h-4" />, gradient: 'from-rose-500/20 to-pink-500/20', glow: 'text-rose-400' },
  { id: 'bank', label: 'ATMs & Banks', icon: <DollarSign className="w-4 h-4" />, gradient: 'from-emerald-500/20 to-green-500/20', glow: 'text-emerald-400' },
  { id: 'hospital', label: 'Hospitals', icon: <Hospital className="w-4 h-4" />, gradient: 'from-red-500/20 to-rose-500/20', glow: 'text-red-400' },
  { id: 'hotel', label: 'Hotels', icon: <Home className="w-4 h-4" />, gradient: 'from-indigo-500/20 to-blue-500/20', glow: 'text-indigo-400' },
  { id: 'supermarket', label: 'Groceries', icon: <ShoppingBag className="w-4 h-4" />, gradient: 'from-violet-500/20 to-purple-500/20', glow: 'text-violet-400' },
  { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" />, gradient: 'from-blue-500/20 to-cyan-500/20', glow: 'text-blue-400' },
];

export const NearbyPoiPanel: React.FC<NearbyPoiPanelProps> = ({
  mapCenter,
  onFlyToPoi,
  onSelectPoisForMap,
}) => {
  const [activeCategory, setActiveCategory] = useState<PoiCategory>('restaurant');
  const [radius, setRadius] = useState<number>(2500);
  const [pois, setPois] = useState<PoiResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (cat: PoiCategory = activeCategory) => {
    setActiveCategory(cat);
    setLoading(true);
    setHasSearched(true);
    const results = await fetchNearbyPois(mapCenter[0], mapCenter[1], cat, radius);
    setPois(results);
    onSelectPoisForMap(results);
    setLoading(false);
  };

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white">Nearby Places</h2>
          <p className="text-[10px] text-slate-500">Real-time POIs via OpenStreetMap</p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleSearch(c.id)}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all group ${
                isActive
                  ? `bg-gradient-to-br ${c.gradient} border-white/[0.12] text-white shadow-lg`
                  : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.09]'
              }`}
            >
              <span className={`transition-colors ${isActive ? c.glow : 'text-slate-500 group-hover:text-slate-300'}`}>
                {c.icon}
              </span>
              <span className="truncate">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Radius + Search */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] flex-1">
          {[1000, 2500, 5000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                radius === r
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r / 1000} km
            </button>
          ))}
        </div>
        <button
          onClick={() => handleSearch(activeCategory)}
          disabled={loading}
          className="px-4 py-2.5 btn-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-0.5">
        {loading ? (
          <div className="space-y-2 pt-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer bg-white/[0.03]" />
            ))}
          </div>
        ) : pois.length > 0 ? (
          pois.map((poi, idx) => (
            <div
              key={poi.id}
              className="glass-card rounded-2xl p-3 space-y-1.5 hover:border-white/[0.12] transition-all group cursor-default"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <span className={`${activeCat?.glow || 'text-amber-400'}`}>
                      {activeCat?.icon}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{poi.name}</h3>
                </div>
                <button
                  onClick={() => onFlyToPoi(poi)}
                  title="View on map"
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {poi.address && (
                <p className="text-[10px] text-slate-500 line-clamp-1 pl-8">{poi.address}</p>
              )}

              {poi.openingHours && (
                <span className="text-[9px] font-mono text-emerald-400/80 pl-8 block">{poi.openingHours}</span>
              )}

              {poi.website && (
                <a
                  href={poi.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline block truncate pl-8"
                >
                  {poi.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          ))
        ) : hasSearched ? (
          <div className="py-10 text-center space-y-2">
            <div className="text-2xl">🔍</div>
            <p className="text-xs text-slate-400">No places found in this area</p>
            <p className="text-[10px] text-slate-600">Try increasing the search radius to 5 km</p>
          </div>
        ) : (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-400/60" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Discover nearby</p>
              <p className="text-[11px] text-slate-600 mt-1">Select a category to find real places around your map center</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
