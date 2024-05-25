import L from 'leaflet';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Import the marker icon image
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Re-define the default icon to use the imported images
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

const OpenStreetMaps = () => {
  // Double-check these coordinates for Lighthouse Point
  const coordinates = [26.2601, -80.0835];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <MapContainer
        center={coordinates}
        zoom={17}
        style={{ height: '500px', width: '640px' }} 
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates}>
          <Popup>
            WahooBay Sensor
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OpenStreetMaps;


