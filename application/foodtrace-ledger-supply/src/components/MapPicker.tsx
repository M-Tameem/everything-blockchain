import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onChange }) => {
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [0, 0];
  return (
    <MapContainer center={center} zoom={5} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onClick={onChange} />
      {latitude !== undefined && longitude !== undefined && (
        <Marker position={[latitude, longitude]} />
      )}
    </MapContainer>
  );
};

export default MapPicker;
