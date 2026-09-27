import React from 'react';
import { Ruler, Triangle, Trash2, Info } from './Icons';
import type { MeasurementMode, LatLngPoint } from '../types/map';

interface MeasurePanelProps {
  measurementMode: MeasurementMode;
  setMeasurementMode: (mode: MeasurementMode) => void;
  measurePoints: LatLngPoint[];
  distanceKm: number;
  areaSqKm: number;
  onClearMeasurement: () => void;
}

export const MeasurePanel: React.FC<MeasurePanelProps> = ({
  measurementMode,
  setMeasurementMode,
  measurePoints,
  distanceKm,
  areaSqKm,
  onClearMeasurement,
}) => {
  const miles = (distanceKm * 0.621371).toFixed(3);
  const feet = (distanceKm * 3280.84).toFixed(1);
  const acres = (areaSqKm * 247.105).toFixed(3);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-emerald-500" />
          Spatial Measurement Tools
        </h2>
        {measurePoints.length > 0 && (
          <button
            onClick={onClearMeasurement}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setMeasurementMode(measurementMode === 'distance' ? 'none' : 'distance')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            measurementMode === 'distance'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Ruler className="w-4 h-4" />
          Distance Mode
        </button>
        <button
          onClick={() => setMeasurementMode(measurementMode === 'area' ? 'none' : 'area')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            measurementMode === 'area'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Triangle className="w-4 h-4" />
          Area Mode
        </button>
      </div>

      {/* Guide / Status Box */}
      {measurementMode !== 'none' ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {measurementMode === 'distance' ? 'Measuring Distance' : 'Measuring Area'}
            </p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Click anywhere on the map to add measurement control points.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400">
          Select Distance or Area mode above to start measuring coordinates directly on the map canvas.
        </div>
      )}

      {/* Measurements Card */}
      {measurePoints.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Points Placed: {measurePoints.length}</span>
              <span className="capitalize font-medium text-emerald-400">{measurementMode}</span>
            </div>

            {/* Distance Metrics */}
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Linear Distance
              </div>
              <div className="text-2xl font-bold text-white">{distanceKm.toFixed(3)} km</div>
              <div className="text-xs text-slate-300 flex items-center gap-3">
                <span>{miles} mi</span>
                <span>•</span>
                <span>{feet} ft</span>
              </div>
            </div>

            {/* Area Metrics (only in area mode) */}
            {measurementMode === 'area' && measurePoints.length >= 3 && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Enclosed Area
                </div>
                <div className="text-xl font-bold text-indigo-400">{areaSqKm.toFixed(4)} km²</div>
                <div className="text-xs text-slate-300">
                  {(areaSqKm * 1000000).toLocaleString()} m² &bull; {acres} acres
                </div>
              </div>
            )}
          </div>

          {/* Points list */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Control Points ({measurePoints.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] font-mono pr-1">
              {measurePoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300"
                >
                  <span className="font-sans text-slate-500">#{idx + 1}</span>
                  <span>
                    {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
