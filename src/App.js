import React, { useRef, useEffect, useState } from 'react';
import { loadModules } from 'esri-loader';
import IconButton from '@mui/material/IconButton';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

const Map = () => {
  const mapRef = useRef(null);
  const [basemap, setBasemap] = useState('streets');

  // Function to handle basemap change
  const handleBasemapChange = () => {
    setBasemap(basemap === 'streets' ? 'satellite' : 'streets');
  };

  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/PopupTemplate'], { css: true })
      .then(([Map, MapView, GraphicsLayer, Graphic, PopupTemplate]) => {
        // Create a new map
        const map = new Map({
          basemap: basemap
        });

        // Create a new map view
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-80.08280, 26.25955], // Center of the map
          zoom: 17
        });

        // Create a graphics layer to hold the markers
        const graphicsLayer = new GraphicsLayer();

        // Add the graphics layer to the map
        map.add(graphicsLayer);

        // Array of marker locations
        const markerLocations = [
          { longitude: -80.08355, latitude: 26.2606, title: 'Wahoo Bay', content: 'https://beta.wahoobay.net/pages/dashpage' } // Coordinates for sensor
          // Add more marker locations if needed
        ];

        // Create and add marker graphics for each location
        markerLocations.forEach(location => {
          // Create a marker graphic
          const markerGraphic = new Graphic({
            geometry: {
              type: 'point',
              longitude: location.longitude,
              latitude: location.latitude
            },
            symbol: {
              type: 'simple-marker',
              style: 'diamond',
              color: 'purple',
              size: '19px',
              outline: {
                color: [255, 255, 255],
                width: 1
              }
            }
          });

          // Create a popup template
          const popupTemplate = new PopupTemplate({
            title: location.title,
            content: `<a href="${location.content}" target="_blank">View Dashboard</a>`
          });

          // Set the popup template for the marker graphic
          markerGraphic.popupTemplate = popupTemplate;

          // Add the marker graphic to the graphics layer
          graphicsLayer.add(markerGraphic);
        });

      })
      .catch((err) => {
        console.error(err);
      });
  }, [basemap]);

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: 'calc(100% - 48px)', marginBottom: '20px' }} />
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        {/* Button with switch icon to toggle between basemaps */}
        <IconButton onClick={handleBasemapChange}>
          {basemap === 'streets' ? <ToggleOnIcon /> : <ToggleOffIcon />}
        </IconButton>
      </div>
    </div>
  );
};

export default Map;

