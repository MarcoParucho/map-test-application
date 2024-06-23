import React, { useRef, useEffect, useState } from 'react';
import { loadModules } from 'esri-loader';
import IconButton from '@mui/material/IconButton';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import NavigationIcon from '@mui/icons-material/Navigation';

// Define the API URL
const config = {
    API_URL: 'http://wahoobay-dev-env-v3.eba-pb7w9arq.us-east-2.elasticbeanstalk.com',
};

const Map = () => {
    const mapRef = useRef(null);
    const [basemap, setBasemap] = useState('osm');
    const [sensor1Info, setSensor1Info] = useState(null);
    const [currentMarker, setCurrentMarker] = useState(0); // State to keep track of the current marker
    const viewRef = useRef(null); // Ref to store the MapView instance

    useEffect(() => {
        fetchData(`${config.API_URL}/api/v1/sitedata/latest?site=1`) // site url 1
            .then((data) => {
                // Process data for site 1
                console.log('Data for site 1:', data);
                setSensor1Info(data?.readings); // Set the sensor info state
            })
            .catch((error) => {
                console.error('Error fetching data for site 1:', error);
            });
    }, []);

    // Function to handle basemap change
    const handleBasemapChange = () => {
        setBasemap(basemap === 'osm' ? 'satellite' : 'osm');
    };

    // Function to fetch sensor data
    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    useEffect(() => {
        loadModules(
            ['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/PopupTemplate'],
            { css: true }
        )
            .then(([Map, MapView, GraphicsLayer, Graphic, PopupTemplate]) => {
                // Create a new map
                const map = new Map({
                    basemap: basemap,
                });

                // Create a new map view
                const view = new MapView({
                    container: mapRef.current,
                    map: map,
                    center: [-80.0828, 26.25955], // Initial center of the map
                    zoom: 16,
                    constraints: {
                        minZoom: 16,
                        maxZoom: 18,
                        rotationEnabled: false, // Disable rotation
                        snapToZoom: false, // Disable zoom snapping
                    },
                    navigation: {
                        mouseWheelZoomEnabled: false, // Disable zooming with mouse wheel
                        browserTouchPanEnabled: false, // Disable panning with touch gestures
                    },
                });

                // Store the view instance in the ref
                viewRef.current = view;

                // Disable map interaction
                view.on("drag", (event) => {
                    event.stopPropagation();
                });

                // Create a graphics layer to hold the markers
                const graphicsLayer = new GraphicsLayer();

                // Add the graphics layer to the map
                map.add(graphicsLayer);

                // Array of marker locations
                const markerLocations = [
                    {
                        longitude: -80.08335,
                        latitude: 26.2603,
                        title: 'Wahoo Bay',
                        content: 'https://beta.wahoobay.net/pages/dashpage',
                        color: 'red',
                    },
                    {
                        longitude: -80.0865,
                        latitude: 26.2350,
                        title: 'Pompano Fishing Pier',
                        content: 'https://example.com/second',
                        color: 'yellow',
                    },
                ];

                // Create and add marker graphics for each location
                markerLocations.forEach((location) => {
                    // Create a marker graphic
                    const markerGraphic = new Graphic({
                        geometry: {
                            type: 'point',
                            longitude: location.longitude,
                            latitude: location.latitude,
                        },
                        symbol: {
                            type: 'simple-marker',
                            style: 'diamond',
                            color: location.color,
                            size: '17px',
                            outline: {
                                color: [255, 255, 255],
                                width: 1,
                            },
                        },
                    });

                    // Create a popup template
                    const popupTemplate = new PopupTemplate({
                        title: location.title,
                        content: `<div >
                                    Air Temperature: ${sensor1Info ? sensor1Info[7] : 'Loading...'}° C<br>
                                    Water Level: ${sensor1Info ? sensor1Info[18] : 'Loading...'} meters<br>
                                    Average Wind Speed today: ${sensor1Info ? sensor1Info[5] : 'Loading...'}<br>
                                    <a style={{marginTop: "1rem"}} href="${location.content}" target="_blank">View Dashboard</a>
                                  </div>`,
                    });

                    // Set the popup template for the marker graphic
                    markerGraphic.popupTemplate = popupTemplate;

                    // Add the marker graphic to the graphics layer
                    graphicsLayer.add(markerGraphic);
                });

                // Fetch sensor data
                fetchData(`${config.API_URL}/api/v1/sitedata/latest?site=1`) // site url 1
                    .then((data) => {
                        // Process data for site 1
                        console.log('Data for site 1:', data);
                        setSensor1Info(data); // Set the sensor info state
                    })
                    .catch((error) => {
                        console.error('Error fetching data for site 1:', error);
                    });
            })
            .catch((err) => {
                console.error(err);
            });
    }, [basemap]);

    // Function to switch to the next marker
    const switchMarker = () => {
        const markerLocations = [
            {
                longitude: -80.08355,
                latitude: 26.2606,
                title: 'Wahoo Bay',
                content: 'https://beta.wahoobay.net/pages/dashpage',
                color: 'red',
            },
            {
                longitude: -80.0890,
                latitude: 26.2354,
                title: 'Second Marker',
                content: 'https://example.com/second',
                color: 'red',
            },
        ];

        const nextMarker = (currentMarker + 1) % markerLocations.length;
        setCurrentMarker(nextMarker);
        if (viewRef.current) {
            viewRef.current.center = [markerLocations[nextMarker].longitude, markerLocations[nextMarker].latitude];
        }
    };

    return (
        <div style={{ marginTop: '9rem', height: '80vh', width: '80%', position: 'relative' }}>
            <div ref={mapRef} style={{ height: 'calc(100% - 48px)', marginBottom: '20px' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {/* Button with switch icon to toggle between basemaps */}
                <IconButton onClick={handleBasemapChange}>
                    {basemap === 'osm' ? (
                        <ToggleOnIcon style={{ color: 'white' }} />
                    ) : (
                        <ToggleOffIcon style={{ color: 'white' }} />
                    )}
                </IconButton>
                {/* Button to switch between markers */}
                <IconButton onClick={switchMarker}>
                    <NavigationIcon style={{ color: 'white' }} />
                </IconButton>
            </div>
        </div>
    );
};

export default Map;
