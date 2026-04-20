import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { savePickupLocation, getUserActiveLocation } from '../apis/garbageApi';

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
  const seq = Date.now().toString().slice(-4);
  return `GB-IND-${area}-${seq}`;
}

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

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
};

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

const CurrentLocationButton = () => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map || controlRef.current) return;

    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
    button.innerHTML = '📍';
    button.title = 'Go to My Location';
    button.style.backgroundColor = 'white';
    button.style.width = '34px';
    button.style.height = '34px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.fontSize = '20px';
    button.style.borderRadius = '4px';
    button.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';

    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);

    button.onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
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

    return () => {
      if (controlRef.current && map) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map]);

  return null;
};

const LeafletMap = ({ user, selectedLocation, onMapClick, garbageDumps }) => {
  const [myLocation, setMyLocation] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [pathPositions, setPathPositions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const locationWatchIdRef = useRef(null);

  // Fetch user's existing active location from backend on page load
  useEffect(() => {
    const fetchUserActiveLocation = async () => {
      if (!user || user.role !== 'user') {
        setIsLoadingExisting(false);
        return;
      }
      
      try {
        const userLocation = await getUserActiveLocation();
        if (userLocation && userLocation.active) {
          console.log('📦 Loaded existing pickup location from backend:', userLocation);
          
          const existingPickup = {
            id: userLocation._id,
            lat: userLocation.lat,
            lng: userLocation.long,
            long: userLocation.long,
            name: userLocation.locationName,
            locationName: userLocation.locationName,
            userId: user?.id,
            active: true,
            timestamp: userLocation.createdAt || new Date().toISOString()
          };
          
          setPickupLocations([existingPickup]);
          
          setClickedLocation({
            lat: userLocation.lat,
            lng: userLocation.long,
            locationName: userLocation.locationName,
            id: userLocation._id,
            active: true
          });
          
          onMapClick({
            lat: userLocation.lat,
            lng: userLocation.long,
            locationName: userLocation.locationName
          });
        }
      } catch (error) {
        console.log('No existing active location found:', error.message);
      } finally {
        setIsLoadingExisting(false);
      }
    };
    
    fetchUserActiveLocation();
  }, [user, onMapClick]);

  // Initialize socket connection with real-time updates
  useEffect(() => {
    const socketUrl = 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setConnectionStatus('connected');
      
      // Send user info to server immediately
      newSocket.emit('user-connect', {
        userId: user?.id,
        role: user?.role
      });
      
      // Request immediate location refresh
      newSocket.emit('refresh-locations');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnectionStatus('disconnected');
    });

    // Real-time driver location updates
    newSocket.on('driver-location-update', (location) => {
      console.log('📍 Driver location received INSTANTLY:', location);
      setDriverLocation(location);
    });

    // Immediate pickup location updates
    newSocket.on('existing-pickup-locations', (locations) => {
      console.log('📦 Existing pickup locations:', locations?.length || 0);
      const otherLocations = (locations || []).filter(loc => loc.userId !== user?.id);
      const userLocation = pickupLocations.filter(loc => loc.userId === user?.id);
      setPickupLocations([...userLocation, ...otherLocations]);
    });

    newSocket.on('new-pickup-location', (location) => {
      console.log('🆕 New pickup location from another user INSTANTLY:', location);
      if (location.userId !== user?.id) {
        setPickupLocations(prev => {
          if (prev.some(loc => loc.id === location.id)) return prev;
          return [location, ...prev];
        });
      }
    });

    // INSTANT pickup completion event
    newSocket.on('pickup-completed', (data) => {
      console.log('✅ Pickup completed event received INSTANTLY:', data);
      alert(`🎉 ${data.message || 'Your garbage has been collected!'}`);
      
      // Remove the completed pickup from state immediately
      setPickupLocations(prev => prev.filter(loc => loc.id !== data.pickupId));
      
      // Clear clicked location if it was the completed one
      if (clickedLocation && clickedLocation.id === data.pickupId) {
        setClickedLocation(null);
        setPathPositions([]);
      }
      
      // Clear from parent if needed
      if (onMapClick) {
        onMapClick(null);
      }
    });

    newSocket.on('pickup-location-removed', (pickupId) => {
      console.log('🗑️ Pickup location removed INSTANTLY:', pickupId);
      setPickupLocations(prev => prev.filter(loc => loc.id !== pickupId));
      if (clickedLocation && clickedLocation.id === pickupId) {
        setClickedLocation(null);
        setPathPositions([]);
      }
    });

    newSocket.on('pickup-cancelled', (data) => {
      console.log('❌ Pickup cancelled:', data);
      alert(`ℹ️ ${data.message || 'Pickup request cancelled'}`);
      setPickupLocations(prev => prev.filter(loc => loc.id !== data.pickupId));
      if (clickedLocation && clickedLocation.id === data.pickupId) {
        setClickedLocation(null);
        setPathPositions([]);
      }
    });

    newSocket.on('pickup-confirmed', (pickup) => {
      console.log('✅ Pickup confirmed by server:', pickup);
      setPickupLocations(prev => {
        const filtered = prev.filter(loc => loc.userId !== user?.id);
        return [...filtered, pickup];
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('driver-location-update');
        socketRef.current.off('existing-pickup-locations');
        socketRef.current.off('new-pickup-location');
        socketRef.current.off('pickup-completed');
        socketRef.current.off('pickup-location-removed');
        socketRef.current.off('pickup-cancelled');
        socketRef.current.off('pickup-confirmed');
        socketRef.current.disconnect();
      }
    };
  }, [user?.id, clickedLocation, onMapClick, pickupLocations]);

  // Get user's current location using watchPosition (real-time)
  useEffect(() => {
    if (user?.role !== 'user') return;

    const startWatchingLocation = () => {
      if (navigator.geolocation) {
        // Use watchPosition for continuous tracking
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setMyLocation({ lat, lng });
            
            // Send location to socket immediately when changed
            if (socketRef.current && connectionStatus === 'connected') {
              const locationData = {
                userId: user?.id,
                lat: lat,
                lng: lng,
                timestamp: new Date().toISOString()
              };
              socketRef.current.emit('location', locationData);
            }
          },
          (error) => {
            console.error("Geolocation error:", error.message);
            // Set default location if geolocation fails
            const lat = 25.4745;
            const lng = 81.8787;
            setMyLocation({ lat, lng });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // Reduced timeout for faster response
            maximumAge: 0, // Always get fresh location
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
  }, [user, connectionStatus]);

  useEffect(() => {
    if (selectedLocation) {
      setClickedLocation(selectedLocation);
    }
  }, [selectedLocation]);

  const cancelPickup = async (pickupId) => {
    if (socketRef.current && window.confirm('Are you sure you want to cancel this pickup request?')) {
      // Also deactivate in backend
      try {
        await fetch(`http://localhost:3000/api/v1/location/${pickupId}/deactivate`, {
          method: 'PATCH',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to deactivate in backend:', error);
      }
      
      socketRef.current.emit('cancel-pickup', pickupId);
      setPickupLocations(prev => prev.filter(loc => loc.id !== pickupId));
      if (clickedLocation && clickedLocation.id === pickupId) {
        setClickedLocation(null);
        setPathPositions([]);
      }
    }
  };

  // Only allow ONE active pickup location per user
  const handleMapClick = async (e) => {
    if (!user || user.role !== 'user') {
      alert('Please login as a user to request pickup');
      return;
    }

    // Check if user already has an active pickup
    const userActivePickup = pickupLocations.find(loc => loc.userId === user?.id && loc.active);
    
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
      console.error("Reverse geocoding failed:", error);
    }
    
    const confirmPickup = window.confirm(
      `Are you sure you want to ${userActivePickup ? 'UPDATE your pickup to' : 'set'} "${locationName}" as your pickup location?`
    );

    if (!confirmPickup) return;

    const location = { 
      lat, 
      lng, 
      locationName, 
      active: true,
      id: userActivePickup?.id || Date.now(),
      userId: user?.id
    };

    setClickedLocation(location);
    onMapClick(location);
    
    try {
      // Save to backend API (this will UPSERT - update if exists, create if not)
      const result = await savePickupLocation(location);
      
      const savedLocation = result.location || result;
      
      // Emit to socket for real-time driver update
      if (socketRef.current && connectionStatus === 'connected') {
        const pickupData = {
          id: savedLocation._id || location.id,
          lat: location.lat,
          lng: location.lng,
          long: location.lng,
          name: location.locationName,
          locationName: location.locationName,
          userId: user?.id,
          active: true,
          timestamp: new Date().toISOString()
        };
        
        socketRef.current.emit('new-pickup-location', pickupData);
        
        // Update local state - remove old and add new
        setPickupLocations(prev => {
          const filtered = prev.filter(loc => loc.userId !== user?.id);
          return [...filtered, pickupData];
        });
        
        alert(`✅ Pickup location ${userActivePickup ? 'updated' : 'requested'} successfully! A driver will be assigned soon.`);
      } else {
        alert('⚠️ Pickup location saved but real-time updates are offline.');
      }
    } catch (error) {
      console.error("Failed to save pickup location:", error.message);
      alert('❌ Failed to save pickup location. Please try again.');
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
      console.error("Failed to fetch route:", error);
      setPathPositions([
        [myLocation.lat, myLocation.lng],
        [dumpData.lat, dumpData.long],
      ]);
    }
  };

  const handleDriverLocationClick = () => {
    if (driverLocation && mapRef.current) {
      mapRef.current.setView([driverLocation.lat, driverLocation.lng], 14);
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

  if (!myLocation || isLoadingExisting) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{isLoadingExisting ? 'Loading your saved location...' : 'Getting your location...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {connectionStatus !== 'connected' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {connectionStatus === 'connecting' ? '🔄 Connecting to real-time server...' : 
           connectionStatus === 'error' ? '⚠️ Real-time updates offline' :
           '🔌 Disconnected from real-time server'}
        </div>
      )}
      
      <MapContainer
        center={[myLocation.lat, myLocation.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapClickHandler onClick={handleMapClick} />
        <CurrentLocationButton />

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

        {driverLocation && (
          <Marker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={userIcon('blue')}
            eventHandlers={{
              click: handleDriverLocationClick
            }}
          >
            <Popup>
              <div>
                <strong className="block mb-1">🚛 Driver Location</strong>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(driverLocation.timestamp).toLocaleTimeString()}
                </p>
                <button 
                  onClick={handleDriverLocationClick}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Center on Driver
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Show the user's active pickup (should be only ONE) */}
        {pickupLocations.filter(loc => loc.userId === user?.id && loc.active).map((location) => (
          <Marker
            key={`my-pickup-${location.id}`}
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
                  Requested: {new Date(location.timestamp).toLocaleString()}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelPickup(location.id);
                  }}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                >
                  Cancel Request
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedLocation && (
          <RecenterMap lat={selectedLocation.lat} lng={selectedLocation.lng} />
        )}

        {garbageDumps?.data?.map((dump, index) => (
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
              <div className="min-w-[150px]">
                <strong className="block mb-2">🗑️ {dump.name || 'Garbage Dump'}</strong>
                {dump.address && <p className="text-sm mb-2">{dump.address}</p>}
                <button 
                  onClick={() => handleMarkerClick(dump)}
                  className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm"
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
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Driver Location (Live)</span>
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