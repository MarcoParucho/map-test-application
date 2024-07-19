import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'esri-leaflet';
import IconButton from '@mui/material/IconButton';
import NavigationIcon from '@mui/icons-material/Navigation';
import BasemapToggleIcon from '@mui/icons-material/Map';

const config = {
    API_URL: 'http://wahoobay-dev-env-v3.eba-pb7w9arq.us-east-2.elasticbeanstalk.com',
};

const Map = () => {
    const [sensor1Info, setSensor1Info] = useState(null);
    const [currentCoord, setCurrentCoord] = useState(0);
    const [basemap, setBasemap] = useState('satellite'); // 'satellite' or 'osm'

    useEffect(() => {
        fetchData(`${config.API_URL}/api/v1/sitedata/latest?site=1`)
            .then((data) => {
                console.log('Data for site 1:', data);
                setSensor1Info(data?.readings);
            })
            .catch((error) => {
                console.error('Error fetching data for site 1:', error);
            });
    }, []);

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

    const coordinates = [
        {
            longitude: -80.08335,
            latitude: 26.2603,
            title: 'Wahoo Bay',
        },
        {
            longitude: -80.0873,
            latitude: 26.2351,
            title: 'Pompano Fishing Pier',
        },
    ];

    const markerLocations = [
        ...coordinates,
        {
            longitude: -80.0865,
            latitude: 26.235,
            title: 'Live Feed',
            color: 'orange',
            videoEmbed: `<iframe width="300" height="315" src="https://www.youtube.com/embed/VkOJ2QBts84?si=E6BFQ6tXGZm1RORb&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
        },
    ];

    const switchMarker = () => {
        const nextCoord = (currentCoord + 1) % coordinates.length;
        setCurrentCoord(nextCoord);
    };

    const toggleBasemap = () => {
        setBasemap(basemap === 'satellite' ? 'osm' : 'satellite');
    };

    const esriBasemapUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
    const osmBasemapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const MapCenter = () => {
        const map = useMap();
        useEffect(() => {
            const { latitude, longitude } = coordinates[currentCoord];
            map.setView([latitude, longitude], map.getZoom());
        }, [currentCoord, map]);
        return null;
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', position: 'relative' }}>
            <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                <MapContainer center={[26.25955, -80.0828]} zoom={16} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url={basemap === 'satellite' ? `${esriBasemapUrl}/tile/{z}/{y}/{x}` : osmBasemapUrl}
                    />
                    {markerLocations.map((location, index) => (
                        <Marker
                            key={index}
                            position={[location.latitude, location.longitude]}
                            icon={L.icon({
                                iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${location.color || (index === 2 ? 'orange' : 'red')}.png`,
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })}
                        >
                            <Popup>
                                {location.color === 'orange' ? (
                                    <div dangerouslySetInnerHTML={{ __html: location.videoEmbed }} />
                                ) : (
                                    <div>
                                        <div>{location.title}</div>
                                        <div>Air Temperature: {sensor1Info ? sensor1Info[7] : 'Loading...'}° C</div>
                                        <div>Water Level: {sensor1Info ? sensor1Info[18] : 'Loading...'} meters</div>
                                        <div>Average Wind Speed today: {sensor1Info ? sensor1Info[5] : 'Loading...'} km/h</div>
                                        <a href="https://beta.wahoobay.net/pages/dashpage" target="_blank" rel="noopener noreferrer">View Dashboard</a>
                                    </div>
                                )}
                            </Popup>
                        </Marker>
                    ))}
                    <MapCenter />
                </MapContainer>
                <div style={{ position: 'absolute', top: '10px', right: '1%', zIndex: 1000 }}>
                    <IconButton onClick={switchMarker}>
                        <NavigationIcon style={{ color: 'white' }} />
                    </IconButton>
                </div>
                <div style={{ position: 'absolute', top: '50px', right: '1%', zIndex: 1000 }}>
                    <IconButton onClick={toggleBasemap}>
                        <BasemapToggleIcon style={{ color: 'white' }} />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default Map;
