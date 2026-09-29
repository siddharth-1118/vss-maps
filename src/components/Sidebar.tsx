import React from 'react';
import {
  X,
  Search,
  Navigation,
  Bookmark,
  Ruler,
  FileCode,
  Layers,
  MapPin,
  Compass,
  Sparkles,
} from './Icons';
import type { ActiveTab, SavedMarker, RouteResult, MeasurementMode, LatLngPoint } from '../types/map';
import { RoutePanel } from './RoutePanel';
import { SavedPlacesPanel } from './SavedPlacesPanel';
import { MeasurePanel } from './MeasurePanel';
import { GeoJsonPanel } from './GeoJsonPanel';
import { LayerSelector } from './LayerSelector';
import { NearbyPoiPanel } from './NearbyPoiPanel';
import { IsochronePanel } from './IsochronePanel';
import { OverlapPanel } from './OverlapPanel';
import { OfflineMeshPanel } from './OfflineMeshPanel';
import type { PoiResult } from '../services/overpass';
import { Clock } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onFlyToCoords?: (lat: number, lng: number) => void;

  selectedSearchResult: any | null;
  onAddSearchAsMarker: (result: any) => void;

  mapCenter: [number, number];
  onFlyToPoi: (poi: PoiResult) => void;
  onSelectPoisForMap: (pois: PoiResult[]) => void;

  onCalculateRoute: (start: [number, number], end: [number, number], profile: any) => void;
  routeResult: RouteResult | null;
  loadingRoute: boolean;
  onClearRoute: () => void;

  savedMarkers: SavedMarker[];
  onFlyToMarker: (marker: SavedMarker) => void;
  onEditMarker: (marker: SavedMarker) => void;
  onDeleteMarker: (id: string) => void;
  onExportMarkers: () => void;

  measurementMode: MeasurementMode;
  setMeasurementMode: (mode: MeasurementMode) => void;
  measurePoints: LatLngPoint[];
  distanceKm: number;
  areaSqKm: number;
  onClearMeasurement: () => void;

  onLoadGeoJSON: (data: any) => void;
  onExportGeoJSON: () => void;
  currentGeoJson: any | null;
  onClearGeoJSON: () => void;

  activeLayer: any;
  onSelectLayer: (layer: any) => void;

  // Isochrone props
  onGenerateIsochrone: (polygons: any[]) => void;
  onClearIsochrone: () => void;
  hasIsochrone: boolean;

  // Overlap props
  onCalculateIntersection: (resultPolygon: any, buffers: any[]) => void;
  onClearIntersection: () => void;
  hasIntersection: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onFlyToCoords,
  selectedSearchResult,
  onAddSearchAsMarker,
  mapCenter,
  onFlyToPoi,
  onSelectPoisForMap,
  onCalculateRoute,
  routeResult,
  loadingRoute,
  onClearRoute,
  savedMarkers,
  onFlyToMarker,
  onEditMarker,
  onDeleteMarker,
  onExportMarkers,
  measurementMode,
  setMeasurementMode,
  measurePoints,
  distanceKm,
  areaSqKm,
  onClearMeasurement,
  onLoadGeoJSON,
  onExportGeoJSON,
  currentGeoJson,
  onClearGeoJSON,
  activeLayer,
  onSelectLayer,
  onGenerateIsochrone,
  onClearIsochrone,
  hasIsochrone,
  onCalculateIntersection,
  onClearIntersection,
  hasIntersection,
}) => {
  if (!isOpen) return null;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; accent?: string }[] = [
    { id: 'search', label: 'Explore', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'route', label: 'Route', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'nearby', label: 'Nearby', icon: <Sparkles className="w-3.5 h-3.5" />, accent: 'text-amber-400' },
    { id: 'isochrone', label: 'Isochrones', icon: <Clock className="w-3.5 h-3.5" />, accent: 'text-emerald-400' },
    { id: 'overlap', label: 'Spot Finder', icon: <Compass className="w-3.5 h-3.5" />, accent: 'text-violet-400' },
    { id: 'mesh', label: 'Offline Mesh', icon: <Navigation className="w-3.5 h-3.5" />, accent: 'text-teal-400' },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: 'measure', label: 'Measure', icon: <Ruler className="w-3.5 h-3.5" /> },
    { id: 'geojson', label: 'GeoJSON', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'layers', label: 'Layers', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="sidebar-premium w-full sm:w-[22rem] flex flex-col h-[calc(100vh-4rem)] z-20 animate-slide-in-left shrink-0">
      {/* Tab strip */}
      <div className="flex items-center gap-0.5 px-3 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'tab-active text-blue-300 scale-[1.02]'
                  : `text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] ${tab.accent || ''}`
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="ml-2 w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Explore Tab ── */}
        {activeTab === 'search' && (
          <div className="p-4 space-y-4 animate-fade-in-up">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Explore & Discover</h2>
                <p className="text-[10px] text-slate-500">Search for any place worldwide</p>
              </div>
            </div>

            {selectedSearchResult ? (
              <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                      {selectedSearchResult.display_name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      {parseFloat(selectedSearchResult.lat).toFixed(5)}, {parseFloat(selectedSearchResult.lon).toFixed(5)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onAddSearchAsMarker(selectedSearchResult)}
                  className="w-full py-2 btn-primary text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save as Pin
                </button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                  <Search className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Search the world</p>
                  <p className="text-[11px] text-slate-600 mt-1">Type in the search bar above or click anywhere on the map</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Route Tab ── */}
        {activeTab === 'route' && <RoutePanel onCalculateRoute={onCalculateRoute} routeResult={routeResult} loadingRoute={loadingRoute} onClearRoute={onClearRoute} />}

        {/* ── Nearby Tab ── */}
        {activeTab === 'nearby' && <NearbyPoiPanel mapCenter={mapCenter} onFlyToPoi={onFlyToPoi} onSelectPoisForMap={onSelectPoisForMap} />}

        {/* ── Isochrones Tab ── */}
        {activeTab === 'isochrone' && <IsochronePanel mapCenter={mapCenter} onGenerateIsochrone={onGenerateIsochrone} onClearIsochrone={onClearIsochrone} hasIsochrone={hasIsochrone} />}

        {/* ── Overlap Spot Finder Tab ── */}
        {activeTab === 'overlap' && <OverlapPanel savedMarkers={savedMarkers} onCalculateIntersection={onCalculateIntersection} onClearIntersection={onClearIntersection} hasIntersection={hasIntersection} />}

        {/* ── Offline Mesh Tab ── */}
        {activeTab === 'mesh' && <OfflineMeshPanel mapCenter={mapCenter} onFlyToCoords={(lat, lng) => onFlyToCoords && onFlyToCoords(lat, lng)} />}

        {/* ── Saved Tab ── */}
        {activeTab === 'saved' && <SavedPlacesPanel markers={savedMarkers} onFlyToMarker={onFlyToMarker} onEditMarker={onEditMarker} onDeleteMarker={onDeleteMarker} onExportMarkers={onExportMarkers} />}

        {/* ── Measure Tab ── */}
        {activeTab === 'measure' && <MeasurePanel measurementMode={measurementMode} setMeasurementMode={setMeasurementMode} measurePoints={measurePoints} distanceKm={distanceKm} areaSqKm={areaSqKm} onClearMeasurement={onClearMeasurement} />}

        {/* ── GeoJSON Tab ── */}
        {activeTab === 'geojson' && <GeoJsonPanel onLoadGeoJSON={onLoadGeoJSON} onExportGeoJSON={onExportGeoJSON} currentGeoJson={currentGeoJson} onClearGeoJSON={onClearGeoJSON} />}

        {/* ── Layers Tab ── */}
        {activeTab === 'layers' && <LayerSelector activeLayer={activeLayer} onSelectLayer={onSelectLayer} />}
      </div>
    </aside>
  );
};
