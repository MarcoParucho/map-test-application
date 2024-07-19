import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'esri-leaflet';
import IconButton from '@mui/material/IconButton';
import NavigationIcon from '@mui/icons-material/Navigation';


const config = {
    API_URL: 'http://wahoobay-dev-env-v3.eba-pb7w9arq.us-east-2.elasticbeanstalk.com',
};

const Map = () => {
    const [sensor1Info, setSensor1Info] = useState(null);
    const [currentMarker, setCurrentMarker] = useState(0);

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

    const markerLocations = [
        {
            longitude: -80.08335,
            latitude: 26.2603,
            title: 'Wahoo Bay',
            color: 'red',
        },
        {
            longitude: -80.0865,
            latitude: 26.235,
            title: 'Live Feed',
            color: 'purple',
            video: '/WahooBay_video.mp4', // Ensure this path is correct
        },
        {
            longitude: -80.0873,
            latitude: 26.2351,
            title: 'Pompano Fishing Pier',
            color: 'yellow',
        },
    ];

    const switchMarker = () => {
        const nextMarker = (currentMarker + 1) % markerLocations.length;
        setCurrentMarker(nextMarker);
    };

    const esriBasemapUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';

    return (
        <div style={{ marginTop: '9rem', height: '80vh', width: '80%' }}>
            <MapContainer center={[26.25955, -80.0828]} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url={`${esriBasemapUrl}/tile/{z}/{y}/{x}`}
                />
                {markerLocations.map((location, index) => (
                    <Marker
                        key={index}
                        position={[location.latitude, location.longitude]}
                        icon={L.icon({
                            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${location.color}.png`,
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })}
                    >
                        <Popup>
                            {location.color === 'purple' ? (
                                <div>
                                    <video controls width="100%">
                                        <source src={location.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
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
            </MapContainer>
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <IconButton onClick={switchMarker}>
                    <NavigationIcon style={{ color: 'white' }} />
                </IconButton>
            </div>
        </div>
    );
};

export default Map;
