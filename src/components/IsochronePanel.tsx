import React, { useState } from 'react';
import { Compass, Car, Footprints, Bike, Clock, Sparkles } from './Icons';
import * as turf from '@turf/turf';

interface IsochronePanelProps {
  mapCenter: [number, number];
  onGenerateIsochrone: (polygons: { min: number; color: string; geometry: any }[]) => void;
  onClearIsochrone: () => void;
  hasIsochrone: boolean;
}

export const IsochronePanel: React.FC<IsochronePanelProps> = ({
  mapCenter,
  onGenerateIsochrone,
  onClearIsochrone,
  hasIsochrone,
}) => {
  const [mode, setMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [selectedMins, setSelectedMins] = useState<number[]>([5, 10, 15, 30]);

  // Average speeds in km/h for modes
  const SPEED_KMH = {
    driving: 45,
    cycling: 16,
    walking: 5,
  };

  const ZONE_COLORS: Record<number, string> = {
    5: '#10b981',   // 5 min = Emerald
    10: '#3b82f6',  // 10 min = Blue
    15: '#f59e0b',  // 15 min = Amber
    30: '#ef4444',  // 30 min = Red
    45: '#8b5cf6',  // 45 min = Purple
    60: '#ec4899',  // 60 min = Pink
  };

  const handleCalculate = () => {
    const speed = SPEED_KMH[mode];
    const centerPoint = turf.point([mapCenter[1], mapCenter[0]]); // [lng, lat] for Turf

    const polygons = selectedMins.map((mins) => {
      // Distance in km = (speed km/h) * (mins / 60)
      const distKm = (speed * mins) / 60;

      // Create smooth travel buffer polygon using Turf.js
      const buffered = turf.buffer(centerPoint, distKm, { units: 'kilometers', steps: 64 });

      return {
        min: mins,
        color: ZONE_COLORS[mins] || '#3b82f6',
        geometry: buffered,
      };
    });

    onGenerateIsochrone(polygons);
  };

  const toggleMin = (m: number) => {
    if (selectedMins.includes(m)) {
      if (selectedMins.length === 1) return; // Keep at least one
      setSelectedMins(selectedMins.filter((x) => x !== m));
    } else {
      setSelectedMins([...selectedMins, m].sort((a, b) => a - b));
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            Travel-Time Isochrones
            <span className="text-[9px] font-semibold tracking-widest uppercase bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              EXCLUSIVE
            </span>
          </h2>
          <p className="text-[10px] text-slate-500">Reachability contour map by time</p>
        </div>
      </div>

      {/* Intro info */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[11px] text-slate-400 leading-relaxed">
        Google Maps can't show this! Visualize exact distance contours reachable from your current map center within 5, 10, 15, or 30 minutes.
      </div>

      {/* Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['driving', 'cycling', 'walking'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all capitalize ${
                mode === m
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/[0.03] border-white/[0.05] text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'driving' && <Car className="w-3.5 h-3.5" />}
              {m === 'cycling' && <Bike className="w-3.5 h-3.5" />}
              {m === 'walking' && <Footprints className="w-3.5 h-3.5" />}
              <span>{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intervals */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Time Thresholds (Minutes)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 30].map((mins) => {
            const isSelected = selectedMins.includes(mins);
            return (
              <button
                key={mins}
                onClick={() => toggleMin(mins)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/[0.05] bg-white/[0.03] text-slate-500 hover:text-slate-300'
                }`}
              >
                {mins} m
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Coords */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Map Center Point:</span>
        <span className="font-mono text-emerald-400 font-bold">{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</span>
      </div>

      {/* Generate & Clear buttons */}
      <div className="flex items-center gap-2 pt-1">
        {hasIsochrone && (
          <button
            onClick={onClearIsochrone}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            Clear Isochrones
          </button>
        )}
        <button
          onClick={handleCalculate}
          className="flex-1 py-2.5 btn-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Generate Isochrone Zones
        </button>
      </div>

      {/* Legend */}
      {hasIsochrone && (
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Isochrone Map Legend
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedMins.map((mins) => (
              <div key={mins} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-md"
                  style={{ backgroundColor: ZONE_COLORS[mins] }}
                />
                <span className="text-slate-300 font-medium">{mins} mins reachable</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
