import React, { useState } from 'react';
import { Navigation, Car, Footprints, Bike, MapPin, ArrowRightLeft, Clock, Compass, Plus, Trash2 } from './Icons';
import type { RouteResult } from '../types/map';
import type { TransportProfile } from '../services/osrm';
import { searchLocation } from '../services/nominatim';

interface RoutePanelProps {
  onCalculateRoute: (
    start: [number, number],
    end: [number, number],
    profile: TransportProfile
  ) => void;
  routeResult: RouteResult | null;
  loadingRoute: boolean;
  onClearRoute: () => void;
}

interface Waypoint {
  id: string;
  query: string;
  coords: [number, number] | null;
  suggestions: any[];
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  onCalculateRoute,
  routeResult,
  loadingRoute,
  onClearRoute,
}) => {
  const [profile, setProfile] = useState<TransportProfile>('driving');

  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 'w1', query: '', coords: null, suggestions: [] },
    { id: 'w2', query: '', coords: null, suggestions: [] },
  ]);

  const routeDebounceRef = React.useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

  const handleQueryChange = (index: number, val: string) => {
    setWaypoints((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], query: val };
      return updated;
    });

    if (routeDebounceRef.current[index]) {
      clearTimeout(routeDebounceRef.current[index]);
    }

    if (val.trim().length < 2) {
      setWaypoints((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], suggestions: [] };
        return updated;
      });
      return;
    }

    routeDebounceRef.current[index] = setTimeout(async () => {
      const res = await searchLocation(val);
      setWaypoints((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], suggestions: res };
        }
        return updated;
      });
    }, 400);
  };

  const handleSelectSuggestion = (index: number, item: any) => {
    const updated = [...waypoints];
    updated[index].query = item.display_name;
    updated[index].coords = [parseFloat(item.lat), parseFloat(item.lon)];
    updated[index].suggestions = [];
    setWaypoints(updated);
  };

  const handleAddStop = () => {
    if (waypoints.length >= 5) return;
    setWaypoints((prev) => [
      ...prev.slice(0, prev.length - 1),
      { id: `w_${Date.now()}`, query: '', coords: null, suggestions: [] },
      prev[prev.length - 1],
    ]);
  };

  const handleRemoveStop = (index: number) => {
    if (waypoints.length <= 2) return;
    setWaypoints((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSwap = () => {
    const updated = [...waypoints];
    const first = updated[0];
    const last = updated[updated.length - 1];
    updated[0] = { ...last };
    updated[updated.length - 1] = { ...first };
    setWaypoints(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCoords = waypoints.filter((w) => w.coords !== null).map((w) => w.coords!);
    if (validCoords.length >= 2) {
      onCalculateRoute(validCoords[0], validCoords[validCoords.length - 1], profile);
    }
  };

  const canSubmit = waypoints.filter((w) => w.coords !== null).length >= 2;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-500" />
          Multi-Stop Route Planner
        </h2>
        {routeResult && (
          <button
            onClick={onClearRoute}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
          >
            Clear Route
          </button>
        )}
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setProfile('driving')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            profile === 'driving'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Car className="w-4 h-4" />
          Driving
        </button>
        <button
          onClick={() => setProfile('walking')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            profile === 'walking'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Footprints className="w-4 h-4" />
          Walking
        </button>
        <button
          onClick={() => setProfile('cycling')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            profile === 'cycling'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bike className="w-4 h-4" />
          Cycling
        </button>
      </div>

      {/* Origin, Destination & Intermediate Stops Form */}
      <form onSubmit={handleSubmit} className="space-y-3 relative">
        {waypoints.map((wp, idx) => {
          const isOrigin = idx === 0;
          const isDest = idx === waypoints.length - 1;
          const label = isOrigin ? 'Start Location' : isDest ? 'Destination' : `Stop #${idx}`;

          return (
            <div key={wp.id} className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </label>
                {!isOrigin && !isDest && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    className="text-[10px] text-rose-500 hover:underline"
                  >
                    Remove Stop
                  </button>
                )}
              </div>

              <div className="relative flex items-center gap-1.5">
                <MapPin
                  className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isOrigin ? 'text-emerald-500' : isDest ? 'text-rose-500' : 'text-amber-500'
                  }`}
                />
                <input
                  type="text"
                  value={wp.query}
                  onChange={(e) => handleQueryChange(idx, e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Suggestions Dropdown */}
              {wp.suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50">
                  {wp.suggestions.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(idx, item)}
                      className="w-full text-left p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 truncate block border-b border-slate-100 dark:border-slate-700/50"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Action Controls: Add Stop & Swap */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAddStop}
            disabled={waypoints.length >= 5}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Intermediate Stop
          </button>
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin & Destination"
            className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loadingRoute}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loadingRoute ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Calculating OSRM Multi-Stop Route...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Find Route
            </>
          )}
        </button>
      </form>

      {/* Route Result Summary Card */}
      {routeResult && (
        <div className="space-y-3 pt-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{routeResult.distanceKm} km</div>
              <div className="text-xs opacity-90">
                {(routeResult.distanceKm * 0.621371).toFixed(2)} miles total distance
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {routeResult.durationMin} min
              </div>
              <div className="text-xs opacity-90 capitalize">{profile} mode</div>
            </div>
          </div>

          {/* Turn-by-turn Navigation Steps */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Turn-by-Turn Directions ({routeResult.steps.length} steps)
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {routeResult.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <Compass className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {step.instruction}
                    </p>
                    {step.distance > 0 && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        In {step.distance} meters
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
