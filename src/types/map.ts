export type MapLayerId = 'osm' | 'satellite' | 'dark' | 'topo' | 'transit' | 'cyclosm' | 'railway' | 'seamap' | 'stamen_toner';

export interface MapLayerConfig {
  id: MapLayerId;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export type MarkerCategory = 'favorite' | 'work' | 'home' | 'restaurant' | 'attraction' | 'custom';

export interface SavedMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: MarkerCategory;
  description?: string;
  color?: string;
  createdAt: string;
  address?: string;
}

export interface GeocodeResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  name: string;
  type: string;
  modifier?: string;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [lat, lng] array
  steps: RouteStep[];
}

export type ActiveTab = 'search' | 'route' | 'saved' | 'measure' | 'geojson' | 'layers' | 'nearby' | 'weather' | 'share' | 'isochrone' | 'overlap' | 'solar';

export type MeasurementMode = 'none' | 'distance' | 'area';

export interface LatLngPoint {
  lat: number;
  lng: number;
}
