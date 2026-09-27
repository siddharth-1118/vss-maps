import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Navigation,
  Bookmark,
  Ruler,
  FileCode,
  Layers,
  Locate,
  Sun,
  Moon,
  MapPin,
  X,
  Compass,
  Sparkles,
  Share2,
  Eye,
  Clock,
} from './Icons';
import type { ActiveTab, GeocodeResult } from '../types/map';
import { searchLocation } from '../services/nominatim';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectSearchResult: (result: GeocodeResult) => void;
  onLocateUser: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenStreetView: () => void;
  onToggleSolar: () => void;
  solarOpen: boolean;
  onOpenLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectSearchResult,
  onLocateUser,
  isDarkMode,
  setIsDarkMode,
  sidebarOpen,
  setSidebarOpen,
  onOpenShareModal,
  onOpenStreetView,
  onToggleSolar,
  solarOpen,
  onOpenLanding,
}) => {
  // ── Uncontrolled input: browser owns the display, React only reads value ──
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasValue, setHasValue] = useState(false); // tracks whether to show clear btn
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search — fires 400ms after the LAST keystroke, not on every one
  const handleInput = () => {
    const val = inputRef.current?.value ?? '';
    const newHasValue = val.length > 0;
    setHasValue((prev) => (prev !== newHasValue ? newHasValue : prev));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchLocation(val);
      setSuggestions(results);
      setLoading(false);
      setShowDropdown(true);
    }, 400);
  };

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = '';
    setHasValue(false);
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = (item: GeocodeResult) => {
    onSelectSearchResult(item);
    // Write into the uncontrolled input without triggering a React re-render
    if (inputRef.current) inputRef.current.value = item.display_name;
    setHasValue(true);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; color?: string }[] = [
    { id: 'search', label: 'Explore', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'route', label: 'Route', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'nearby', label: 'Nearby', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-amber-400' },
    { id: 'isochrone', label: 'Isochrones', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
    { id: 'overlap', label: 'Spot Finder', icon: <Compass className="w-3.5 h-3.5" />, color: 'text-violet-400' },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'measure', label: 'Measure', icon: <Ruler className="w-3.5 h-3.5" /> },
    { id: 'geojson', label: 'GeoJSON', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'layers', label: 'Layers', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="header-premium h-16 px-5 flex items-center justify-between z-30 relative">
      {/* Left: Branding */}
      <button
        onClick={onOpenLanding}
        title="View Landing Page"
        className="flex items-center gap-3 shrink-0 text-left hover:opacity-90 transition-opacity"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">VSS Maps</h1>
            <span className="text-[9px] font-semibold tracking-widest uppercase bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              STUDIO
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide">
            OpenStreetMap · 100% Self-Owned
          </p>
        </div>
      </button>

      {/* Center: Premium Search Bar */}
      <div className="flex-1 max-w-xl mx-6 relative" ref={dropdownRef}>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors z-10" />
          <input
            ref={inputRef}
            type="text"
            onInput={handleInput}
            onFocus={() => {
              const val = inputRef.current?.value ?? '';
              if (val.trim().length >= 2 && suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search any place, city, or coordinates..."
            className="w-full pl-11 pr-10 py-2.5 rounded-2xl input-premium text-sm relative z-10 font-medium"
            autoComplete="off"
            spellCheck={false}
          />
          {hasValue && (
            <button
              onClick={clearInput}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center transition-all text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Premium Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 glass rounded-2xl shadow-2xl shadow-black/50 max-h-72 overflow-y-auto z-50 border border-white/5">
            {loading ? (
              <div className="p-5 flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Searching OpenStreetMap...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="p-1">
                {suggestions.map((item, idx) => (
                  <button
                    key={item.place_id}
                    onClick={() => handleSelect(item)}
                    className="w-full px-3 py-2.5 text-left text-xs hover:bg-white/5 rounded-xl flex items-start gap-3 text-slate-300 hover:text-white transition-all group"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="line-clamp-2 leading-relaxed">{item.display_name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Search className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">No locations found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Desktop Nav Tabs */}
        <div className="hidden xl:flex items-center gap-0.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all ${
                activeTab === item.id && sidebarOpen
                  ? 'tab-active text-blue-300'
                  : `text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] ${item.color || ''}`
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px h-6 bg-white/[0.06] mx-1" />

        {/* Street View */}
        <button
          onClick={onOpenStreetView}
          title="360° Street View"
          className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all group"
        >
          <Eye className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
          <span className="hidden 2xl:inline">360°</span>
        </button>

        {/* Share */}
        <button
          onClick={onOpenShareModal}
          title="Share Location"
          className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all group"
        >
          <Share2 className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden 2xl:inline">Share</span>
        </button>

        {/* Locate */}
        <button
          onClick={onLocateUser}
          title="My Location"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
        >
          <Locate className="w-4 h-4" />
        </button>

        {/* Solar Tracker */}
        <button
          onClick={onToggleSolar}
          title="Solar & Daylight Tracker"
          className={`h-9 px-3 flex items-center gap-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
            solarOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border-transparent'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="hidden 2xl:inline">Solar</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
