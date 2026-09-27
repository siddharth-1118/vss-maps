import type { SavedMarker, MapLayerId } from '../types/map';

const STORAGE_KEYS = {
  MARKERS: 'mymaps_saved_markers',
  ACTIVE_LAYER: 'mymaps_active_layer',
  RECENT_SEARCHES: 'mymaps_recent_searches',
  GEOJSON_DATA: 'mymaps_geojson_data',
};

export function getStoredMarkers(): SavedMarker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKERS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load stored markers:', err);
    return [];
  }
}

export function saveMarkerToStorage(marker: SavedMarker): SavedMarker[] {
  const current = getStoredMarkers();
  const updated = [marker, ...current.filter((m) => m.id !== marker.id)];
  localStorage.setItem(STORAGE_KEYS.MARKERS, JSON.stringify(updated));
  return updated;
}

export function deleteMarkerFromStorage(id: string): SavedMarker[] {
  const current = getStoredMarkers();
  const updated = current.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MARKERS, JSON.stringify(updated));
  return updated;
}

export function getStoredActiveLayer(): MapLayerId {
  try {
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_LAYER) as MapLayerId) || 'osm';
  } catch {
    return 'osm';
  }
}

export function saveActiveLayer(layerId: MapLayerId): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_LAYER, layerId);
}

export function getStoredGeoJSON(): string | null {
  return localStorage.getItem(STORAGE_KEYS.GEOJSON_DATA);
}

export function saveGeoJSON(jsonString: string): void {
  localStorage.setItem(STORAGE_KEYS.GEOJSON_DATA, jsonString);
}
