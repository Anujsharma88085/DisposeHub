import { useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CleaningServices } from '@mui/icons-material';
import { savePickupLocation } from '../apis/garbageApi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getAreaCode(lat, lng) {
  if (lat > 28 && lng > 76 && lng < 78) return "DEL";
  if (lat > 18 && lat < 20 && lng > 72 && lng < 73) return "MUM";
  if (lat > 12 && lat < 14 && lng > 77 && lng < 78) return "BLR";
  return "GEN";
}

function generateDustbinName(lat, lng) {
  const area = getAreaCode(lat, lng);
  const seq = Date.now().toString().slice(-4); // last 4 digits
  return `GB-IND-${area}-${seq}`;
}

const userIcon = (color = 'blue') =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13);
  }, [lat, lng]);
  return null;
};

const MapClickHandler = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);
  return null;
};

const CurrentLocationButton = () => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) return;

    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = '📍';
    button.title = 'Go to My Location';
    button.style.backgroundColor = 'white';
    button.style.width = '34px';
    button.style.height = '34px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';

    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);

    button.onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Recenter the map to current location
            map.setView([lat, lng], 14);

          },
          (error) => {
            console.error('Geolocation error:', error);
            alert('Failed to get your current location.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    };

    const control = L.control({ position: 'topright' });
    control.onAdd = () => button;
    control.addTo(map);
    controlRef.current = control;
  }, [map]);

  return null;
};


const LeafletMap = ({ selectedLocation, onMapClick, garbageDumps }) => {
  const [myLocation, setMyLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [pathPositions, setPathPositions] = useState([]);

  const user = useSelector((state) => state.auth.user);
 
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMyLocation({ lat, lng });
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          // Default to MNNIT Prayagraj
          const lat = 25.4745;
          const lng = 81.8787;
          setMyLocation({ lat, lng });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      }
    };
  
    if (user?.role !== 'user') return;

    updateLocation();
    const interval = setInterval(updateLocation, 20000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (selectedLocation) {
      setClickedLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;

    let locationName = "Unnamed Location";

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf6248976fd365a133423bab235324a680ada8&point.lat=${lat}&point.lon=${lng}`
      );

      const data = await response.json();
      locationName =
        data.features?.[0]?.properties?.name || locationName;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
    let active = true;
    const location = { lat, lng, locationName , active };

    const confirmPickup = window.confirm(
      `Are you sure you want to set "${locationName}" as your pickup location?`
    );

    if (!confirmPickup) return;

    setClickedLocation(location);
    onMapClick(location);
    try {
      const result = await savePickupLocation (location);
    } catch (error) {
      console.error("Failed to save pickup location:", error.message);
    }
  };

  const handleMarkerClick = async (dumpData) => {
    if (!myLocation) return;
  
    try {
      // Fetch route from OSRM API
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${myLocation.lng},${myLocation.lat};${dumpData.long},${dumpData.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setPathPositions(coords);
      } else {
        setPathPositions([
          [myLocation.lat, myLocation.lng],
          [dumpData.lat, dumpData.long],
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setPathPositions([
        [myLocation.lat, myLocation.lng],
        [dumpData.lat, dumpData.long],
      ]);
    }
  };
  
  if (user?.role !== 'user' || !myLocation) {
    return <div className="text-center mt-4">🛑 Only User can access the live map.</div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[myLocation.lat, myLocation.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onClick={handleMapClick} />

        <CurrentLocationButton/>

        <TileLayer
          attribution="&copy; DisposeHub"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pathPositions.length > 0 && (
          <Polyline
            positions={pathPositions}
            color="#2563eb" 
            weight={2}      
            opacity={1.0}   
            lineCap="round"  
            lineJoin="round" 
            smoothFactor={1} 
          />
        )}

        {myLocation && (
          <Marker
            position={[myLocation.lat, myLocation.lng]}
            icon={userIcon('red')}
          >
            <Popup>My Current Location</Popup>
          </Marker>
        )}

        {selectedLocation && (
          <RecenterMap lat={selectedLocation.lat} lng={selectedLocation.lng} />
        )}

        {garbageDumps.data?.map((dump, index) => (
        <Marker
          key={`dump-${index}`}
          position={[dump.lat, dump.long]}
          icon={greenIcon}
          eventHandlers={{
              click: () => {
                handleMarkerClick(dump);
              }
          }}
        >
          <Popup>
            <div>
              <strong>{dump.name || 'Garbage Dump'}</strong>
              {dump.address && <p>{dump.address}</p>}
            </div>
          </Popup>
        </Marker>
        ))}

        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={userIcon('yellow')}
          >
            <Popup>{clickedLocation.locationName}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;