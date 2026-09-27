import React, { useState } from 'react';
import { FileCode, Upload, Download, CheckCircle, AlertCircle, Sparkles } from './Icons';

interface GeoJsonPanelProps {
  onLoadGeoJSON: (geoJsonData: any) => void;
  onExportGeoJSON: () => void;
  currentGeoJson: any | null;
  onClearGeoJSON: () => void;
}

export const GeoJsonPanel: React.FC<GeoJsonPanelProps> = ({
  onLoadGeoJSON,
  onExportGeoJSON,
  currentGeoJson,
  onClearGeoJSON,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onLoadGeoJSON(parsed);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Invalid GeoJSON format file. Please upload valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteLoad = () => {
    try {
      if (!jsonText.trim()) return;
      const parsed = JSON.parse(jsonText);
      onLoadGeoJSON(parsed);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Invalid JSON string format.');
    }
  };

  const loadSampleData = () => {
    const sample = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Eiffel Tower', city: 'Paris' },
          geometry: { type: 'Point', coordinates: [2.2945, 48.8584] },
        },
        {
          type: 'Feature',
          properties: { name: 'Statue of Liberty', city: 'New York' },
          geometry: { type: 'Point', coordinates: [-74.0445, 40.6892] },
        },
        {
          type: 'Feature',
          properties: { name: 'Tokyo Tower', city: 'Tokyo' },
          geometry: { type: 'Point', coordinates: [139.7454, 35.6586] },
        },
        {
          type: 'Feature',
          properties: { name: 'Sydney Opera House', city: 'Sydney' },
          geometry: { type: 'Point', coordinates: [151.2153, -33.8568] },
        },
      ],
    };
    onLoadGeoJSON(sample);
    setErrorMsg('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-purple-500" />
          GeoJSON Spatial Data
        </h2>
        {currentGeoJson && (
          <button
            onClick={onClearGeoJSON}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium"
          >
            Clear Layer
          </button>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Export Map Data
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Download your saved places and map features into standard GeoJSON format for QGIS, ArcGIS, or web apps.
        </p>
        <button
          onClick={onExportGeoJSON}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download .geojson File
        </button>
      </div>

      {/* File Upload Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Import GeoJSON File
        </h3>
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
          <Upload className="w-6 h-6 text-purple-500 mb-1" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Click to upload .geojson or .json
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Supports Point, LineString, Polygon</span>
          <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Quick Sample Button */}
      <button
        onClick={loadSampleData}
        className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-amber-500" />
        Load Sample Landmarks GeoJSON
      </button>

      {/* Paste raw JSON */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          Paste Raw GeoJSON
        </h3>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{"type": "FeatureCollection", "features": [...] }'
          className="w-full h-28 p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
        ></textarea>
        <button
          onClick={handlePasteLoad}
          className="w-full py-2 bg-slate-800 dark:bg-slate-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
        >
          Render Pasted GeoJSON
        </button>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {currentGeoJson && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>GeoJSON feature layer loaded on map!</span>
        </div>
      )}
    </div>
  );
};
