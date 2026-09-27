import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  GeoJSON,
  useMap,
  useMapEvents,
  ScaleControl,
} from 'react-leaflet';
import L from 'leaflet';
import type {
  MapLayerId,
  SavedMarker,
  RouteResult,
  MeasurementMode,
  LatLngPoint,
} from '../types/map';
import { MAP_LAYERS } from '../constants/layers';
import { Navigation, Eye, Sparkles } from './Icons';
import { WeatherWidget } from './WeatherWidget';
import type { PoiResult } from '../services/overpass';

// Premium teardrop marker icon
function createCustomIcon(color: string = '#3b82f6') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
      <defs>
        <filter id="shadow" x="-30%" y="-10%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
        </filter>
        <radialGradient id="pinGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <path d="M18 2C11.4 2 6 7.4 6 14c0 8.4 12 30 12 30S30 22.4 30 14C30 7.4 24.6 2 18 2z"
        fill="${color}" filter="url(#shadow)"/>
      <path d="M18 2C11.4 2 6 7.4 6 14c0 8.4 12 30 12 30S30 22.4 30 14C30 7.4 24.6 2 18 2z"
        fill="url(#pinGrad)"/>
      <circle cx="18" cy="13.5" r="5" fill="white" opacity="0.95"/>
    </svg>`;
  return L.divIcon({
    html: `<div style="transform:translate(-50%,-100%);display:flex;align-items:center;justify-content:center;">${svg}</div>`,
    className: 'custom-map-pin',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
  });
}

// Premium pulsating user location icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;width:24px;height:24px;background:rgba(59,130,246,0.3);border-radius:50%;animation:pulse-ring 2s infinite;"></span>
      <span style="position:absolute;width:18px;height:18px;background:rgba(59,130,246,0.15);border-radius:50%;"></span>
      <span style="width:12px;height:12px;background:#3b82f6;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);position:relative;z-index:1;"></span>
    </div>`,
  className: 'user-location-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});


interface MapViewProps {
  activeLayer: MapLayerId;
  savedMarkers: SavedMarker[];
  poiMarkers?: PoiResult[];
  routeResult: RouteResult | null;
  measurementMode: MeasurementMode;
  measurePoints: LatLngPoint[];
  onAddMeasurePoint: (pt: LatLngPoint) => void;
  geoJsonData: any | null;
  userLocation: [number, number] | null;
  mapCenter: [number, number];
  zoom: number;
  onMapClick: (lat: number, lng: number) => void;
  onSelectMarker: (marker: SavedMarker) => void;
  onOpenStreetView?: () => void;
  isochronePolygons?: { min: number; color: string; geometry: any }[];
  intersectionResult?: any;
  intersectionBuffers?: any[];
}

// Map Controller for dynamic panning and zooming
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

// Map Event Listener for clicks
function MapEventsHandler({
  measurementMode,
  onAddMeasurePoint,
  onMapClick,
}: {
  measurementMode: MeasurementMode;
  onAddMeasurePoint: (pt: LatLngPoint) => void;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (measurementMode !== 'none') {
        onAddMeasurePoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  activeLayer,
  savedMarkers,
  poiMarkers = [],
  routeResult,
  measurementMode,
  measurePoints,
  onAddMeasurePoint,
  geoJsonData,
  userLocation,
  mapCenter,
  zoom,
  onMapClick,
  onSelectMarker,
  onOpenStreetView,
  isochronePolygons = [],
  intersectionResult,
  intersectionBuffers = [],
}) => {
  const currentLayerConfig = MAP_LAYERS[activeLayer] || MAP_LAYERS.osm;

  // Format measure points for Polyline/Polygon
  const polylineCoords = measurePoints.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="flex-1 h-full w-full relative z-1">
      {/* Live Weather Overlay — top-right */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-auto">
        <WeatherWidget lat={mapCenter[0]} lng={mapCenter[1]} />
      </div>

      {/* Floating 360° Pegman Button — bottom-left */}
      {onOpenStreetView && (
        <button
          onClick={onOpenStreetView}
          title="Open 360° Street View"
          className="absolute bottom-8 left-5 z-[400] glass border border-white/[0.08] hover:border-blue-500/30 px-4 py-2.5 rounded-2xl shadow-2xl shadow-black/50 transition-all group hover:shadow-blue-500/20 flex items-center gap-2.5 cursor-pointer hover:scale-[1.03]"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[11px] font-bold text-white leading-none">360° Panorama</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Street View</p>
          </div>
        </button>
      )}


      <MapContainer
        center={mapCenter}
        zoom={zoom}
        zoomControl={true}
        className="w-full h-full"
      >
        <MapController center={mapCenter} zoom={zoom} />
        <MapEventsHandler
          measurementMode={measurementMode}
          onAddMeasurePoint={onAddMeasurePoint}
          onMapClick={onMapClick}
        />

        {/* Dynamic High-Speed Tile Layer */}
        <TileLayer
          key={activeLayer}
          url={currentLayerConfig.url}
          attribution={currentLayerConfig.attribution}
          maxZoom={currentLayerConfig.maxZoom}
          subdomains={currentLayerConfig.subdomains || []}
          keepBuffer={6}
          updateWhenIdle={false}
          updateWhenZooming={false}
          crossOrigin="anonymous"
        />

        <ScaleControl position="bottomright" imperial={true} metric={true} />

        {/* User Location Pin */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby POI Markers */}
        {poiMarkers.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={createCustomIcon('#f59e0b')}
          >
            <Popup>
              <div className="p-2.5 max-w-xs space-y-1 text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{poi.name}</span>
                </div>
                {poi.address && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {poi.address}
                  </p>
                )}
                {poi.openingHours && (
                  <p className="text-[10px] text-emerald-600 font-mono">
                    Hours: {poi.openingHours}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  {poi.lat.toFixed(5)}, {poi.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Saved Places Marker Pins */}
        {savedMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.color)}
            eventHandlers={{
              click: () => onSelectMarker(marker),
            }}
          >
            <Popup>
              <div className="p-3 max-w-xs space-y-1.5 text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: marker.color || '#3b82f6' }}
                  ></div>
                  <h3 className="font-bold text-xs">{marker.name}</h3>
                </div>
                {marker.description && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {marker.description}
                  </p>
                )}
                <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                  {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line & Waypoints */}
        {routeResult && routeResult.geometry.length > 0 && (
          <>
            <Polyline
              positions={routeResult.geometry}
              pathOptions={{
                color: '#3b82f6',
                weight: 6,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Start & End markers */}
            <Marker
              position={routeResult.geometry[0]}
              icon={createCustomIcon('#10b981')}
            >
              <Popup>
                <div className="p-2 text-xs font-bold text-emerald-600">Route Origin</div>
              </Popup>
            </Marker>
            <Marker
              position={routeResult.geometry[routeResult.geometry.length - 1]}
              icon={createCustomIcon('#ef4444')}
            >
              <Popup>
                <div className="p-2 text-xs font-bold text-rose-600">Route Destination</div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Measurement Lines / Polygon */}
        {measurementMode === 'distance' && polylineCoords.length > 0 && (
          <>
            <Polyline
              positions={polylineCoords}
              pathOptions={{ color: '#10b981', weight: 4, dashArray: '8, 8' }}
            />
            {polylineCoords.map((pt, idx) => (
              <Marker key={idx} position={pt} icon={createCustomIcon('#10b981')} />
            ))}
          </>
        )}

        {measurementMode === 'area' && polylineCoords.length > 0 && (
          <>
            <Polygon
              positions={polylineCoords}
              pathOptions={{
                color: '#6366f1',
                fillColor: '#818cf8',
                fillOpacity: 0.35,
                weight: 3,
              }}
            />
            {polylineCoords.map((pt, idx) => (
              <Marker key={idx} position={pt} icon={createCustomIcon('#6366f1')} />
            ))}
          </>
        )}

        {/* Isochrone Travel-Time Reachability Polygons */}
        {isochronePolygons.map((iso, idx) => (
          <GeoJSON
            key={`iso_${idx}_${iso.min}`}
            data={iso.geometry}
            style={() => ({
              color: iso.color,
              weight: 2,
              fillColor: iso.color,
              fillOpacity: 0.15,
            })}
          />
        ))}

        {/* Intersection Buffer Rings */}
        {intersectionBuffers.map((buf, idx) => (
          <GeoJSON
            key={`buf_${idx}`}
            data={buf}
            style={() => ({
              color: '#8b5cf6',
              weight: 1.5,
              dashArray: '6, 6',
              fillColor: '#a78bfa',
              fillOpacity: 0.08,
            })}
          />
        ))}

        {/* Calculated Intersection Polygon */}
        {intersectionResult && (
          <GeoJSON
            key={`intersect_${JSON.stringify(intersectionResult.geometry)}`}
            data={intersectionResult}
            style={() => ({
              color: '#10b981',
              weight: 3.5,
              fillColor: '#34d399',
              fillOpacity: 0.45,
            })}
          />
        )}

        {/* Custom GeoJSON Overlay Layer */}
        {geoJsonData && (
          <GeoJSON
            key={JSON.stringify(geoJsonData)}
            data={geoJsonData}
            style={() => ({
              color: '#a855f7',
              weight: 3,
              fillColor: '#c084fc',
              fillOpacity: 0.3,
            })}
          />
        )}
      </MapContainer>
    </div>
  );
};
