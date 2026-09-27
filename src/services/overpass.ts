export type PoiCategory =
  | 'restaurant'
  | 'cafe'
  | 'fuel'
  | 'bank'
  | 'hospital'
  | 'hotel'
  | 'supermarket'
  | 'parking';

export interface PoiResult {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: PoiCategory;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
}

const CATEGORY_QUERY_MAP: Record<PoiCategory, string> = {
  restaurant: '["amenity"="restaurant"]',
  cafe: '["amenity"="cafe"]',
  fuel: '["amenity"="fuel"]',
  bank: '["amenity"~"bank|atm"]',
  hospital: '["amenity"~"hospital|clinic|pharmacy"]',
  hotel: '["tourism"~"hotel|motel|guest_house"]',
  supermarket: '["shop"~"supermarket|convenience"]',
  parking: '["amenity"="parking"]',
};

export async function fetchNearbyPois(
  lat: number,
  lng: number,
  category: PoiCategory = 'restaurant',
  radiusMeters: number = 2500
): Promise<PoiResult[]> {
  try {
    const filter = CATEGORY_QUERY_MAP[category] || CATEGORY_QUERY_MAP.restaurant;
    const query = `[out:json][timeout:15];
(
  node${filter}(around:${radiusMeters},${lat},${lng});
  way${filter}(around:${radiusMeters},${lat},${lng});
);
out center 35;`;

    const url = 'https://overpass-api.de/api/interpreter';
    const res = await fetch(url, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
    });

    if (!res.ok) throw new Error(`Overpass API error: ${res.statusText}`);

    const data = await res.json();
    if (!data.elements) return [];

    const pois: PoiResult[] = [];
    data.elements.forEach((el: any) => {
      const elLat = el.lat || (el.center && el.center.lat);
      const elLng = el.lon || (el.center && el.center.lon);
      if (!elLat || !elLng) return;

      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.brand || `${category.toUpperCase()} (${el.id})`;

      pois.push({
        id: el.id,
        name,
        lat: elLat,
        lng: elLng,
        category,
        address: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : undefined,
        phone: tags.phone || tags['contact:phone'],
        website: tags.website || tags['contact:website'],
        openingHours: tags.opening_hours,
      });
    });

    return pois;
  } catch (err) {
    console.error('Overpass POI fetch error:', err);
    return [];
  }
}
