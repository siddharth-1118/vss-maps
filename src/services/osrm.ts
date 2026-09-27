import type { RouteResult, RouteStep } from '../types/map';

export type TransportProfile = 'driving' | 'walking' | 'cycling';

export async function calculateRoute(
  start: [number, number], // [lat, lng]
  end: [number, number],   // [lat, lng]
  profile: TransportProfile = 'driving'
): Promise<RouteResult | null> {
  try {
    // OSRM expects format: lng,lat;lng,lat
    const profileMap = {
      driving: 'driving',
      walking: 'foot',
      cycling: 'bike',
    };
    const osrmProfile = profileMap[profile];
    const coordinatesStr = `${start[1]},${start[0]};${end[1]},${end[0]}`;
    const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${coordinatesStr}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Routing request failed: ${res.statusText}`);

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const distanceKm = +(route.distance / 1000).toFixed(2);
    const durationMin = Math.round(route.duration / 60);

    // Convert GeoJSON [lng, lat] array to [lat, lng] array for Leaflet
    const geometry: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    const steps: RouteStep[] = [];
    if (route.legs && route.legs.length > 0) {
      route.legs[0].steps.forEach((s: any) => {
        let instruction = s.maneuver.instruction || '';
        if (!instruction) {
          const type = s.maneuver.type;
          const modifier = s.maneuver.modifier;
          const name = s.name ? ` onto ${s.name}` : '';
          instruction = `${type} ${modifier || ''}${name}`.trim();
        }

        steps.push({
          instruction,
          distance: Math.round(s.distance),
          duration: Math.round(s.duration),
          name: s.name || '',
          type: s.maneuver.type,
          modifier: s.maneuver.modifier,
        });
      });
    }

    return {
      distanceKm,
      durationMin,
      geometry,
      steps,
    };
  } catch (error) {
    console.error('OSRM route calculation error:', error);
    return null;
  }
}
