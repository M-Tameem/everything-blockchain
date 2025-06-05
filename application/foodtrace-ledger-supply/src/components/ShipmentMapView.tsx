import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint } from './RouteMapInput';

L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

interface ShipmentMapViewProps {
  farmLocation?: GeoPoint;
  route?: GeoPoint[];
}

const ShipmentMapView: React.FC<ShipmentMapViewProps> = ({ farmLocation, route }) => {
  const farmCoord = farmLocation ? [farmLocation.latitude, farmLocation.longitude] as [number, number] : undefined;
  const routeCoords = route ? route.map(p => [p.latitude, p.longitude]) as [number, number][] : [];
  const center: [number, number] = farmCoord || routeCoords[0] || [0, 0];

  return (
    <MapContainer center={center} zoom={5} style={{ height: '300px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {farmCoord && <Marker position={farmCoord} />}
      {routeCoords.map((c, i) => <Marker key={i} position={c} />)}
      {routeCoords.length > 1 && <Polyline positions={routeCoords} />}
    </MapContainer>
  );
};

export default ShipmentMapView;
