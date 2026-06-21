'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const riderIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'hue-rotate-[160deg] saturate-200' // Make rider icon orange-ish
});

interface Location {
  lat: number;
  lng: number;
}

interface MapDashboardProps {
  riderLocation: Location | null;
  destinations: { id: string; lat: number; lng: number; title: string }[];
}

export default function MapDashboard({ riderLocation, destinations }: MapDashboardProps) {
  const [route, setRoute] = useState<[number, number][]>([]);

  const center: [number, number] = riderLocation 
    ? [riderLocation.lat, riderLocation.lng] 
    : (destinations.length > 0 ? [destinations[0].lat, destinations[0].lng] : [26.9124, 75.7873]); // Default Jaipur

  // Optional: Fetch routing from OSRM between rider and first destination
  useEffect(() => {
    if (riderLocation && destinations.length > 0) {
      const dest = destinations[0];
      fetch(`https://router.project-osrm.org/route/v1/driving/${riderLocation.lng},${riderLocation.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            setRoute(coords);
          }
        })
        .catch(err => console.error('Error fetching route:', err));
    }
  }, [riderLocation, destinations]);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-brand-light shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {riderLocation && (
          <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
            <Popup>
              <strong>You are here</strong>
            </Popup>
          </Marker>
        )}

        {destinations.map(dest => (
          <Marker key={dest.id} position={[dest.lat, dest.lng]} icon={customIcon}>
            <Popup>
              <strong>{dest.title}</strong>
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && (
          <Polyline positions={route} color="#ff9f00" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
