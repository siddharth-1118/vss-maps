import type { GeocodeResult } from '../types/map';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export async function searchLocation(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=10`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    const data = await res.json();
    return data as GeocodeResult[];
  } catch (error) {
    console.error('Nominatim geocode error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
