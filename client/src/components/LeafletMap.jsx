import { useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getSocket } from "../socket/socket";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { savePickupLocation, getUserActiveLocation, cancelLocation, getAllGarbageDumps } from '../apis/garbageApi';
import { registerPickupListeners } from '../socket/listeners';
import { emitLocationUpdate } from '../socket/emitters';
import { toast } from "react-toastify";
import { showErrorToast } from "../utils/showErrorToast";
import { Box, CircularProgress } from '@mui/material';
import {MAP_INITIAL_ZOOM} from '../constants/map'

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = (color = 'blue') =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

const MapClickHandler = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);
  return null;
};

const CurrentLocationButton = ({ myLocation }) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map || controlRef.current) return;

    const button = L.DomUtil.create(
      "button",
      "leaflet-bar leaflet-control leaflet-control-custom"
    );

    button.innerHTML = "📍";
    button.title = "Go to My Location";
    button.style.backgroundColor = "white";
    button.style.width = "34px";
    button.style.height = "34px";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.fontSize = "20px";
    button.style.borderRadius = "4px";
    button.style.boxShadow = "0 1px 5px rgba(0,0,0,0.2)";

    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);

    button.onclick = () => {
      if (!myLocation) {
        toast.error("Current location not available.");
        return;
      }

      map.setView([myLocation.lat, myLocation.lng], MAP_INITIAL_ZOOM, {
        animate: true,
      });
    };

    const control = L.control({ position: "topright" });

    control.onAdd = () => button;
    control.addTo(map);
    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, myLocation]);

  return null;
};

const LeafletMap = () => {
  const [myLocation, setMyLocation] = useState(null);
  const [pathPositions, setPathPositions] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [isLoadingGarbage, setIsLoadingGarbage] = useState(true);
  const [garbageDumps, setGarbageDumps] = useState([]);

  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const locationWatchIdRef = useRef(null);
  const hasLoggedError = useRef(false);

  const user = useSelector((state) => state.auth.user);

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;
    const cleanup = registerPickupListeners(socket, {
      onCompleted: ({ id }) => {
        setPickupLocations(prev =>
          prev.filter(loc => loc._id !== id)
        );
      },
    });

    return cleanup;
  }, [socket]);

  // Fetch user's existing active pickup location from backend
  useEffect(() => {
    const fetchUserActiveLocation = async () => {
      if (!user || user.role !== 'user') {
        setIsLoadingExisting(false);
        return;
      }
      
      try {
        const data = await getUserActiveLocation();
        const userLocation = data?.location;
        if(!userLocation) return;

        if (userLocation && userLocation.active) {
          setPickupLocations([userLocation]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch active pickup:", error);
        }
      } finally {
        setIsLoadingExisting(false);
      }
    };
    
    fetchUserActiveLocation();
  }, [user]);

  // Get user's current location using watchPosition (real-time)
  useEffect(() => {
    if (user?.role !== 'user') return;

    const startWatchingLocation = () => {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            hasLoggedError.current = false;

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setMyLocation({ lat, lng });
            
            emitLocationUpdate({lat, lng});
          },
          (error) => {
            if (!hasLoggedError.current && import.meta.env.DEV) {
              console.error("Geolocation error:", error.message);
              hasLoggedError.current = true;
            }
            // Set default location if geolocation fails
            const lat = 25.4745;
            const lng = 81.8787;
            setMyLocation({ lat, lng });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
        
        locationWatchIdRef.current = watchId;
        return watchId;
      }
      return null;
    };

    startWatchingLocation();

    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    const loadGarbageDumps = async () => {
      try {
        const data = await getAllGarbageDumps();
        setGarbageDumps(data.data || []);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load garbage dumps:", error);
        }
        showErrorToast(error);
      }finally{
        setIsLoadingGarbage(false);
      }
    };

    loadGarbageDumps();
  }, []);

  const cancelPickup = async (pickupId) => {
    if (window.confirm('Are you sure you want to cancel this pickup request?')) {
      try {
        await cancelLocation(pickupId);

        setPickupLocations(prev =>
         prev.filter(loc => loc._id !== pickupId)
        );

        toast.success("Pickup request cancelled successfully.");
      } catch (error) {
        showErrorToast(error);
      }
    }
  };

  // Only allow ONE active pickup location per user
  const handleMapClick = async (e) => {
    if (!user || user.role !== 'user') {
      toast.warning("Please login as a user to request pickup.");
      return;
    }

    // Check if user already has an active pickup
    const userActivePickup = pickupLocations.find(loc => loc.markedBy === user?._id && loc.active);
    
    if (userActivePickup) {
      const updateExisting = window.confirm(
        `You already have an active pickup request at "${userActivePickup.name || 'your previous location'}".\n\nDo you want to UPDATE it to this new location?`
      );
      
      if (!updateExisting) return;
    }

    const { lat, lng } = e.latlng;

    let locationName = "Unnamed Location";

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf6248976fd365a133423bab235324a680ada8&point.lat=${lat}&point.lon=${lng}`
      );

      const data = await response.json();
      locationName = data.features?.[0]?.properties?.name || locationName;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Reverse geocoding failed:", error);
      }
    }
    
    const confirmPickup = window.confirm(
      `Are you sure you want to ${userActivePickup ? 'UPDATE your pickup to' : 'set'} "${locationName}" as your pickup location?`
    );

    if (!confirmPickup) return;

    const location = { 
      lat, 
      lng, 
      locationName,
    };
    
    try {
      const result = await savePickupLocation(location);

      const savedLocation = result.location || result;

      setPickupLocations(prev => {
        const filtered = prev.filter(loc => loc.markedBy !== user?._id);
        return [...filtered,  savedLocation];
      }); 

      toast.success(
        `Pickup location ${
          userActivePickup ? "updated" : "requested"
        } successfully. A driver will be assigned soon.`
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to save pickup location:", error);
      }

      showErrorToast(error);
    }
  };

  const handleMarkerClick = async (dumpData) => {
    if (!myLocation) return;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${myLocation.lng},${myLocation.lat};${dumpData.long},${dumpData.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setPathPositions(coords);
        
        if (mapRef.current) {
          const bounds = L.latLngBounds(coords);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        setPathPositions([
          [myLocation.lat, myLocation.lng],
          [dumpData.lat, dumpData.long],
        ]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch route:", error);
      }
      setPathPositions([
        [myLocation.lat, myLocation.lng],
        [dumpData.lat, dumpData.long],
      ]);
    }
  };

  if (user?.role !== 'user') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <span className="text-4xl mb-4 block">🛑</span>
          <p className="text-gray-700 text-lg">Only users can access the live map.</p>
          <p className="text-gray-500 text-sm mt-2">Please login as a user to request garbage pickup.</p>
        </div>
      </div>
    );
  }

  if (!myLocation || isLoadingExisting || isLoadingGarbage) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="w-full h-full relative">
      
      <MapContainer
        center={[myLocation.lat, myLocation.lng]}
        zoom={MAP_INITIAL_ZOOM}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={false}
      >
        <MapClickHandler onClick={handleMapClick} />
        <CurrentLocationButton myLocation={myLocation} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pathPositions.length > 0 && (
          <Polyline
            positions={pathPositions}
            color="#2563eb"
            weight={4}
            opacity={0.8}
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
            <Popup>
              <div className="text-center">
                <strong className="block mb-1">Your Current Location</strong>
                <p className="text-xs text-gray-500">
                  Lat: {myLocation.lat.toFixed(6)}<br />
                  Lng: {myLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Show the user's active pickup (should be only ONE) */}
        {pickupLocations.filter(loc => loc.markedBy === user?._id && loc.active).map((location) => (
          <Marker
            key={`my-pickup-${location._id}`}
            position={[location.lat, location.long || location.lng]}
            icon={userIcon('orange')}
          >
            <Popup>
              <div className="min-w-[200px]">
                <strong className="block mb-2 text-lg">📍 Your Active Pickup Request</strong>
                <p className="text-sm mb-2">{location.name || location.locationName || 'Pickup Location'}</p>
                <p className="text-xs text-gray-500 mb-3">
                  Status: <span className="text-green-600 font-semibold">Active</span>
                  <br />
                  Requested: {new Date(location.updatedAt).toLocaleString()}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelPickup(location._id);
                  }}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                >
                  Cancel Request
                </button>
              </div>
            </Popup>
          </Marker>
        ))}


        {garbageDumps?.map((dump, index) => (
          <Marker
            key={`dump-${index}`}
            position={[dump.lat, dump.long]}
            icon={greenIcon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[dump._id] = ref;
              }
            }}
          >
            <Popup >
              <div className="min-w-[150px]">
                <strong className="block mb-2">🗑️ {dump.name || 'Garbage Dump'}</strong>
                {dump.address && <p className="text-sm mb-2">{dump.address}</p>}
                <button
                  onClick={() => {
                    setPathPositions([]);
                    markerRefs.current[dump._id]?.closePopup();
                  }}
                  className="w-full px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer"
                >
                  Clear Route
                </button>
                <button 
                  onClick={() => handleMarkerClick(dump)}
                  className="w-full mt-1 px-3 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer"
                >
                  Show Route
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000] text-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Your Location</span>
        </div>        
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Your Active Pickup</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Garbage Dump (Static)</span>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
          💡 Click on map to request/update pickup
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;