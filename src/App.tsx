import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { MarkerModal } from './components/MarkerModal';
import { ShareModal } from './components/ShareModal';
import { StreetViewModal } from './components/StreetViewModal';
import { SolarWidget } from './components/SolarWidget';
import type {
  ActiveTab,
  MapLayerId,
  SavedMarker,
  GeocodeResult,
  RouteResult,
  MeasurementMode,
  LatLngPoint,
} from './types/map';
import type { PoiResult } from './services/overpass';
import {
  getStoredMarkers,
  saveMarkerToStorage,
  deleteMarkerFromStorage,
  getStoredActiveLayer,
  saveActiveLayer,
  getStoredGeoJSON,
  saveGeoJSON,
} from './services/storage';
import { calculateRoute, type TransportProfile } from './services/osrm';
import { reverseGeocode } from './services/nominatim';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<MapLayerId>(getStoredActiveLayer());

  // Saved Markers
  const [savedMarkers, setSavedMarkers] = useState<SavedMarker[]>([]);

  // Nearby POIs state
  const [poiMarkers, setPoiMarkers] = useState<PoiResult[]>([]);

  // Modals state
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [streetViewModalOpen, setStreetViewModalOpen] = useState<boolean>(false);

  // Exclusive Feature States
  const [solarOpen, setSolarOpen] = useState<boolean>(false);
  const [isochronePolygons, setIsochronePolygons] = useState<any[]>([]);
  const [intersectionResult, setIntersectionResult] = useState<any | null>(null);
  const [intersectionBuffers, setIntersectionBuffers] = useState<any[]>([]);

  // Search result state
  const [selectedSearchResult, setSelectedSearchResult] = useState<GeocodeResult | null>(null);

  // Routing state
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Measurement state
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>('none');
  const [measurePoints, setMeasurePoints] = useState<LatLngPoint[]>([]);

  // GeoJSON state
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);

  // Map viewport
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // NYC default
  const [zoom, setZoom] = useState<number>(13);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Marker Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalCoords, setModalCoords] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [modalAddress, setModalAddress] = useState<string>('');
  const [editingMarker, setEditingMarker] = useState<SavedMarker | null>(null);

  // Load initial local data & parse location permalink hash
  useEffect(() => {
    setSavedMarkers(getStoredMarkers());
    const storedGeoJson = getStoredGeoJSON();
    if (storedGeoJson) {
      try {
        setGeoJsonData(JSON.parse(storedGeoJson));
      } catch (err) {
        console.error('Failed to parse stored GeoJSON:', err);
      }
    }

    // Parse #lat=...&lng=...&z=...
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const latParam = params.get('lat');
      const lngParam = params.get('lng');
      const zParam = params.get('z');
      if (latParam && lngParam) {
        const parsedLat = parseFloat(latParam);
        const parsedLng = parseFloat(lngParam);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setMapCenter([parsedLat, parsedLng]);
          if (zParam && !isNaN(parseInt(zParam, 10))) {
            setZoom(parseInt(zParam, 10));
          }
        }
      }
    }
  }, []);

  // Update dark mode class on html root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Map layer change
  const handleSelectLayer = (layerId: MapLayerId) => {
    setActiveLayer(layerId);
    saveActiveLayer(layerId);
  };

  // Handle Search Result Selection
  const handleSelectSearchResult = (result: GeocodeResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setSelectedSearchResult(result);
    setMapCenter([lat, lon]);
    setZoom(15);
    setActiveTab('search');
    setSidebarOpen(true);
  };

  // Handle Geolocation
  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setZoom(15);
        },
        (err) => {
          alert('Geolocation error or permission denied: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle Calculate Route via OSRM
  const handleCalculateRoute = async (
    start: [number, number],
    end: [number, number],
    profile: TransportProfile
  ) => {
    setLoadingRoute(true);
    const res = await calculateRoute(start, end, profile);
    setLoadingRoute(false);
    if (res) {
      setRouteResult(res);
      // Fit center
      const midLat = (start[0] + end[0]) / 2;
      const midLng = (start[1] + end[1]) / 2;
      setMapCenter([midLat, midLng]);
      setZoom(12);
    } else {
      alert('Could not find a valid route between the selected locations.');
    }
  };

  // Handle Map Canvas Clicks
  const handleMapClick = async (lat: number, lng: number) => {
    setEditingMarker(null);
    setModalCoords({ lat, lng });
    const address = await reverseGeocode(lat, lng);
    setModalAddress(address);
    setModalOpen(true);
  };

  // Save Marker Handler
  const handleSaveMarker = (marker: SavedMarker) => {
    const updated = saveMarkerToStorage(marker);
    setSavedMarkers(updated);
  };

  // Delete Marker Handler
  const handleDeleteMarker = (id: string) => {
    const updated = deleteMarkerFromStorage(id);
    setSavedMarkers(updated);
  };

  // Add search item directly as marker pin
  const handleAddSearchAsMarker = (result: GeocodeResult) => {
    const newMarker: SavedMarker = {
      id: `marker_${Date.now()}`,
      name: result.display_name.split(',')[0] || 'Saved Search Place',
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      category: 'favorite',
      color: '#3b82f6',
      description: result.display_name,
      createdAt: new Date().toISOString(),
    };
    handleSaveMarker(newMarker);
    setActiveTab('saved');
  };

  // Fly To Saved Marker
  const handleFlyToMarker = (marker: SavedMarker) => {
    setMapCenter([marker.lat, marker.lng]);
    setZoom(16);
  };

  // Edit Saved Marker
  const handleEditMarker = (marker: SavedMarker) => {
    setEditingMarker(marker);
    setModalCoords({ lat: marker.lat, lng: marker.lng });
    setModalAddress(marker.address || '');
    setModalOpen(true);
  };

  // Spatial Calculations using Turf.js
  const handleAddMeasurePoint = (pt: LatLngPoint) => {
    setMeasurePoints((prev) => [...prev, pt]);
  };

  const calculateDistanceKm = (): number => {
    if (measurePoints.length < 2) return 0;
    const lineCoords = measurePoints.map((p) => [p.lng, p.lat]);
    const line = turf.lineString(lineCoords);
    return turf.length(line, { units: 'kilometers' });
  };

  const calculateAreaSqKm = (): number => {
    if (measurePoints.length < 3) return 0;
    const polygonCoords = [...measurePoints.map((p) => [p.lng, p.lat]), [measurePoints[0].lng, measurePoints[0].lat]];
    const polygon = turf.polygon([polygonCoords]);
    const areaSqMeters = turf.area(polygon);
    return areaSqMeters / 1000000;
  };

  // GeoJSON Handlers
  const handleLoadGeoJSON = (data: any) => {
    setGeoJsonData(data);
    saveGeoJSON(JSON.stringify(data));
  };

  const handleClearGeoJSON = () => {
    setGeoJsonData(null);
    localStorage.removeItem('mymaps_geojson_data');
  };

  // Export GeoJSON FeatureCollection
  const handleExportGeoJSON = () => {
    const features = savedMarkers.map((m) => ({
      type: 'Feature',
      properties: {
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        createdAt: m.createdAt,
      },
      geometry: {
        type: 'Point',
        coordinates: [m.lng, m.lat],
      },
    }));

    const collection = {
      type: 'FeatureCollection',
      features,
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_maps_data_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#020617] overflow-hidden font-sans antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectSearchResult={handleSelectSearchResult}
        onLocateUser={handleLocateUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenStreetView={() => setStreetViewModalOpen(true)}
        onToggleSolar={() => setSolarOpen(!solarOpen)}
        solarOpen={solarOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}

          selectedSearchResult={selectedSearchResult}
          onAddSearchAsMarker={handleAddSearchAsMarker}

          mapCenter={mapCenter}
          onFlyToPoi={(poi) => {
            setMapCenter([poi.lat, poi.lng]);
            setZoom(17);
          }}
          onSelectPoisForMap={(pois) => setPoiMarkers(pois)}

          onCalculateRoute={handleCalculateRoute}
          routeResult={routeResult}
          loadingRoute={loadingRoute}
          onClearRoute={() => setRouteResult(null)}

          savedMarkers={savedMarkers}
          onFlyToMarker={handleFlyToMarker}
          onEditMarker={handleEditMarker}
          onDeleteMarker={handleDeleteMarker}
          onExportMarkers={handleExportGeoJSON}

          measurementMode={measurementMode}
          setMeasurementMode={setMeasurementMode}
          measurePoints={measurePoints}
          distanceKm={calculateDistanceKm()}
          areaSqKm={calculateAreaSqKm()}
          onClearMeasurement={() => setMeasurePoints([])}

          onLoadGeoJSON={handleLoadGeoJSON}
          onExportGeoJSON={handleExportGeoJSON}
          currentGeoJson={geoJsonData}
          onClearGeoJSON={handleClearGeoJSON}

          activeLayer={activeLayer}
          onSelectLayer={handleSelectLayer}

          onGenerateIsochrone={(polygons) => setIsochronePolygons(polygons)}
          onClearIsochrone={() => setIsochronePolygons([])}
          hasIsochrone={isochronePolygons.length > 0}

          onCalculateIntersection={(resultPoly, buffers) => {
            setIntersectionResult(resultPoly);
            setIntersectionBuffers(buffers);
          }}
          onClearIntersection={() => {
            setIntersectionResult(null);
            setIntersectionBuffers([]);
          }}
          hasIntersection={intersectionResult !== null || intersectionBuffers.length > 0}
        />

        {/* Leaflet Map Canvas */}
        <MapView
          activeLayer={activeLayer}
          savedMarkers={savedMarkers}
          poiMarkers={poiMarkers}
          routeResult={routeResult}
          measurementMode={measurementMode}
          measurePoints={measurePoints}
          onAddMeasurePoint={handleAddMeasurePoint}
          geoJsonData={geoJsonData}
          userLocation={userLocation}
          mapCenter={mapCenter}
          zoom={zoom}
          onMapClick={handleMapClick}
          onSelectMarker={(marker) => {
            setEditingMarker(marker);
            setModalCoords({ lat: marker.lat, lng: marker.lng });
            setModalAddress(marker.address || '');
            setModalOpen(true);
          }}
          onOpenStreetView={() => setStreetViewModalOpen(true)}
          isochronePolygons={isochronePolygons}
          intersectionResult={intersectionResult}
          intersectionBuffers={intersectionBuffers}
        />
      </div>

      {/* Solar & Daylight Live Tracker Widget */}
      <SolarWidget
        lat={mapCenter[0]}
        lng={mapCenter[1]}
        isOpen={solarOpen}
        onClose={() => setSolarOpen(false)}
      />

      {/* Marker Modal */}
      <MarkerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMarker}
        initialData={editingMarker}
        lat={modalCoords.lat}
        lng={modalCoords.lng}
        defaultAddress={modalAddress}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        lat={mapCenter[0]}
        lng={mapCenter[1]}
        zoom={zoom}
      />

      {/* 360° Street View Modal */}
      <StreetViewModal
        isOpen={streetViewModalOpen}
        onClose={() => setStreetViewModalOpen(false)}
        lat={mapCenter[0]}
        lng={mapCenter[1]}
      />
    </div>
  );
}


export default App;
