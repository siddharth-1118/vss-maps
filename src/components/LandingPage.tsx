import React from 'react';
import { Compass, Sparkles, Clock, Sun, MapPin, Layers, Navigation, Bookmark, FileCode, ExternalLink, ArrowRight, Check } from './Icons';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col overflow-y-auto selection:bg-blue-500 selection:text-white">
      {/* Background radial grid */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />

      {/* Landing Header */}
      <header className="h-20 px-8 flex items-center justify-between z-20 border-b border-white/[0.06] backdrop-blur-xl bg-[#060913]/80 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Compass className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">VSS Maps</h1>
              <span className="text-[9px] font-semibold tracking-widest uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">100% Self-Owned · Open Source</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/siddharth-1118/vss-maps"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            GitHub Code
          </a>
          <button
            onClick={onLaunchApp}
            className="px-5 py-2.5 rounded-xl btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-transform"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto text-center z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Next-Gen Open Mapping Platform · Zero Paid API Keys</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          The Map Platform You Own <br />
          <span className="text-gradient">With Features Google Maps Doesn't Have</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Full spatial freedom without API billing or data tracking. High-performance interactive maps, travel-time reachability zones, multi-point spot finders, and live solar daylight tracking.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-primary text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 hover:scale-[1.03] transition-all"
          >
            <span>Explore Interactive App</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <a
            href="https://github.com/siddharth-1118/vss-maps"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass text-slate-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2.5 hover:border-white/20 transition-all"
          >
            <ExternalLink className="w-4.5 h-4.5" />
            <span>View Source on GitHub</span>
          </a>
        </div>

        {/* Live Banner Preview Card */}
        <div className="mt-16 glass rounded-3xl p-3 border border-white/10 shadow-2xl shadow-blue-500/10 max-w-5xl mx-auto overflow-hidden group">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/9] flex items-center justify-center">
            <img
              src="/vss_maps_showcase.jpg"
              alt="VSS Maps Studio Interface"
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
              onError={(e) => {
                // Fallback if image asset path varies
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-60" />
            <button
              onClick={onLaunchApp}
              className="absolute px-6 py-3 rounded-2xl bg-blue-600/90 hover:bg-blue-600 backdrop-blur-md text-white font-bold text-xs shadow-2xl flex items-center gap-2 group-hover:scale-105 transition-all"
            >
              <span>Launch Live Interactive Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto z-10 w-full">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Built for Power Users & Developers
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need for spatial analysis, route planning, location saving, and map custom styling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-emerald-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              Travel-Time Isochrones
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Maps can't show this! Calculate and render 5m, 10m, 15m, and 30m reachability contours for driving, walking, or cycling.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-violet-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
              Living Spot & Overlap Finder
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find the perfect home location or meeting point relative to multiple target locations using spatial buffer intersection algorithms.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Solar & Daylight Tracker
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time astronomical sun position tracking: calculate exact sunrise, sunset, solar noon, daylight hours, elevation, and azimuth bearing.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-blue-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
              9 Open Basemap Styles
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch effortlessly between Esri Satellite, CartoDB Dark, OpenTopoMap, CyclOSM, OpenRailwayMap, and OpenSeaMap nautical charts.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              Multi-Stop Routing & POIs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plan multi-waypoint routes with turn-by-turn OSRM directions and search real-time OpenStreetMap POIs (restaurants, gas, cafes).
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass rounded-3xl p-6 border border-white/[0.08] hover:border-rose-500/30 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              100% Privacy & Zero API Keys
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No tracking, no credit cards, no Google API billing. Everything runs on free open-source tile infrastructure and local storage.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="px-6 py-12 border-t border-b border-white/[0.06] bg-white/[0.01] z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400">
          <span className="font-bold text-white uppercase tracking-wider">Built With Modern Stack:</span>
          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> React 18</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> TypeScript</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Vite 6</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Tailwind CSS v4</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Leaflet</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Turf.js</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white">VSS Maps Studio</span>
          <span>© 2026 · Open Source under MIT License</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/siddharth-1118/vss-maps" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            GitHub Repo
          </a>
          <button onClick={onLaunchApp} className="hover:text-blue-400 transition-colors font-semibold">
            Launch App
          </button>
        </div>
      </footer>
    </div>
  );
};
