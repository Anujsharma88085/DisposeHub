import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { deactivateLocation } from '../apis/garbageApi';
import { useSelector } from 'react-redux';
import { emitLocationUpdate } from '../socket/emitters';
import { getSocket } from "../socket/socket";
import { registerDriverListeners } from "../socket/listeners";

// Custom red marker (driver)
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom blue marker for garbage locations (static dustbins)
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Yellow marker for user pickup locations
const yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DriverLeafletMap = ({ pickupLocations, setPickupLocations, garbageDumps }) => {
  const [myLocation, setMyLocation] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const routeInfoControlRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const userMarkersRef = useRef([]);
  const garbageMarkersRef = useRef([]);
  const locationWatchIdRef = useRef(null);
  const hasLoggedError = useRef(false);

  const user = useSelector((state) => state.auth.user);

  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    const cleanup = registerDriverListeners(socket, {
      onPickupCreated: (pickup) => {
        setPickupLocations(prev => {
          if (prev.some(loc => loc.id === pickup.id)) {
            return prev;
          }
          return [...prev, pickup];
        });
      },
      onPickupUpdated: (pickup) => {
        setPickupLocations(prev =>
          prev.map(loc =>
            loc.id === pickup.id ? pickup : loc
          )
        );
      },
      onPickupCompleted: ({ id }) => {
        setPickupLocations(prev =>
          prev.filter(loc => loc.id !== id)
        );
      },
      onPickupCancelled: ({ id }) => {
        setPickupLocations(prev =>
          prev.filter(loc => loc.id !== id)
        );
      },
    });

    return cleanup;
  }, [socket]);

  // Create map once
  useEffect(() => {
    if (!mapRef.current && typeof window !== 'undefined' && document.getElementById('driver-map')) {
      mapRef.current = L.map('driver-map').setView([20.59, 78.96], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Track driver location using watchPosition (real-time)
  useEffect(() => {
    if (user?.role !== 'driver') return;

    const startWatchingLocation = () => {
      if (navigator.geolocation) {
        // Use watchPosition for continuous tracking
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            hasLoggedError.current = false;

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setMyLocation({ lat, lng });
            
            // Send location to socket immediately when changed
            emitLocationUpdate({lat, lng});
          },
          (error) => {
            if (!hasLoggedError.current) {
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
    if (!mapRef.current || !myLocation) return;

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(
        [myLocation.lat, myLocation.lng],
        { icon: redIcon }
      )
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="text-align:center">
            <strong>🚛 Your Current Location</strong><br/>
            Latitude: ${myLocation.lat.toFixed(6)}<br/>
            Longitude: ${myLocation.lng.toFixed(6)}
          </div>
        `)
        .openPopup();

      mapRef.current.setView(
        [myLocation.lat, myLocation.lng],
        15,
        {
          animate: true,
          duration: 0.5
        }
      );
    } else {
      driverMarkerRef.current
        .setLatLng([myLocation.lat, myLocation.lng])
        .setPopupContent(`
          <div style="text-align:center">
            <strong>🚛 Your Current Location</strong><br/>
            Latitude: ${myLocation.lat.toFixed(6)}<br/>
            Longitude: ${myLocation.lng.toFixed(6)}
          </div>
        `);
    }
  }, [myLocation]);

  // Clear all route elements
  const clearRouteElements = () => {
    if (polylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    
    if (routeInfoControlRef.current && mapRef.current) {
      mapRef.current.removeControl(routeInfoControlRef.current);
      routeInfoControlRef.current = null;
    }
    
    if (startMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    
    if (endMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
  };

  const clearRoute = () => {
    clearRouteElements();
  };

  useEffect(() => {
    clearRouteElements();
  }, [pickupLocations]);

  const completePickup = async (pickupId, pickupLocation) => {
    if (window.confirm(`Mark this pickup as completed?\n\nLocation: ${pickupLocation?.name || pickupLocation?.locationName || 'Pickup Location'}`)) {
      
      const response = await deactivateLocation(pickupId);

      if (!response.success) {
        console.error("Failed");
        return;
      } 

      clearRouteElements();
    }
  };

  const calculateRoute = async (startLat, startLng, endLat, endLng, pickupLocation = null) => {
    if (!mapRef.current) return;
    
    setLoadingRoute(true);
    clearRouteElements();

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        polylineRef.current = L.polyline(coordinates, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
        }).addTo(mapRef.current);

        startMarkerRef.current = L.marker([startLat, startLng], { icon: redIcon })
          .addTo(mapRef.current)
          .bindPopup('<b>🚛 Your Current Location</b>');

        const endIcon = pickupLocation ? yellowIcon : blueIcon;
        endMarkerRef.current = L.marker([endLat, endLng], { icon: endIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <b>📍 ${pickupLocation ? 'Pickup Location' : 'Garbage Dump'}</b><br/>
            ${pickupLocation?.name || pickupLocation?.locationName || ''}<br/>
            ${pickupLocation ? `Requested by: ${pickupLocation.userId || 'User'}` : 'Static Location'}
          `);
        
        if (pickupLocation) {
          endMarkerRef.current.options.pickupId = pickupLocation.id;
        }
      
        const bounds = L.latLngBounds(coordinates);
        mapRef.current.fitBounds(bounds, { 
          padding: [100, 100],
          maxZoom: 15,
          duration: 1,
        });

        const distance = (route.distance / 1000).toFixed(1);
        const duration = Math.round(route.duration / 60);
        const eta = new Date(Date.now() + route.duration * 1000).toLocaleTimeString();

        if (routeInfoControlRef.current && mapRef.current) {
          mapRef.current.removeControl(routeInfoControlRef.current);
        }

        const RouteInfoControl = L.Control.extend({
          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar route-info-control');
            container.style.backgroundColor = 'white';
            container.style.padding = '12px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            container.style.fontFamily = 'sans-serif';
            container.style.fontSize = '14px';
            container.style.minWidth = '220px';
            
            container.innerHTML = `
              <div style="margin-bottom: 8px;">
                <strong style="color: #2563eb; font-size: 16px;">🗺️ Route Information</strong>
              </div>
              <div style="margin-bottom: 6px;">
                <span style="color: #666;">Distance:</span> 
                <span style="font-weight: bold; margin-left: 8px;">${distance} km</span>
              </div>
              <div style="margin-bottom: 6px;">
                <span style="color: #666;">Duration:</span> 
                <span style="font-weight: bold; margin-left: 8px;">${duration} min</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #666;">Estimated Arrival:</span> 
                <span style="font-weight: bold; margin-left: 8px;">${eta}</span>
              </div>
              <button 
                id="clear-route-btn"
                style="
                  background: #dc2626;
                  color: white;
                  border: none;
                  padding: 8px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                  width: 100%;
                  font-size: 13px;
                  font-weight: 500;
                  margin-bottom: ${pickupLocation ? '8px' : '0'};
                "
              >
                Clear Route
              </button>
              ${pickupLocation ? `
                <button 
                  id="complete-pickup-btn"
                  style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    font-size: 13px;
                    font-weight: 500;
                  "
                >
                  ✓ Complete Pickup
                </button>
              ` : ''}
            `;
            
            L.DomEvent.on(container.querySelector('#clear-route-btn'), 'click', (e) => {
              L.DomEvent.stopPropagation(e);
              clearRouteElements();
            });
            
            if (pickupLocation) {
              L.DomEvent.on(container.querySelector('#complete-pickup-btn'), 'click', (e) => {
                L.DomEvent.stopPropagation(e);
                completePickup(pickupLocation.id, pickupLocation);
              });
            }
            
            L.DomEvent.disableClickPropagation(container);
            return container;
          }
        });

        routeInfoControlRef.current = new RouteInfoControl({ position: 'bottomleft' });
        routeInfoControlRef.current.addTo(mapRef.current);
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      const coordinates = [[startLat, startLng], [endLat, endLng]];
      polylineRef.current = L.polyline(coordinates, {
        color: '#dc2626',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(mapRef.current);

      startMarkerRef.current = L.marker([startLat, startLng], { icon: redIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Route Start</b>');

      endMarkerRef.current = L.marker([endLat, endLng], { icon: pickupLocation ? yellowIcon : blueIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${pickupLocation ? 'Pickup Location' : 'Destination'}</b>`);

      const ErrorControl = L.Control.extend({
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar error-info-control');
          container.style.backgroundColor = '#fee2e2';
          container.style.padding = '10px';
          container.style.borderRadius = '5px';
          container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
          container.style.fontFamily = 'sans-serif';
          container.style.fontSize = '14px';
          container.style.minWidth = '200px';
          container.style.border = '1px solid #fca5a5';
          
          container.innerHTML = `
            <div style="margin-bottom: 5px;">
              <strong style="color: #dc2626;">⚠️ Route Calculation Failed</strong>
            </div>
            <div style="margin-bottom: 8px; color: #7f1d1d; font-size: 12px;">
              Using straight line route. Service unavailable.
            </div>
            <button 
              id="clear-error-route-btn"
              style="
                background: #dc2626;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 13px;
                font-weight: 500;
              "
            >
              Clear Route
            </button>
          `;
          
          L.DomEvent.on(container.querySelector('#clear-error-route-btn'), 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            clearRouteElements();
          });
          
          L.DomEvent.disableClickPropagation(container);
          return container;
        }
      });

      routeInfoControlRef.current = new ErrorControl({ position: 'bottomleft' });
      routeInfoControlRef.current.addTo(mapRef.current);
    } finally {
      setLoadingRoute(false);
    }
  };

  // Static garbage dumps from database (blue markers)
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    garbageMarkersRef.current.forEach(marker => {
      if (mapRef.current && marker) {
        mapRef.current.removeLayer(marker);
      }
    });
    garbageMarkersRef.current = [];

    const garbageData = garbageDumps || [];

    garbageData.forEach((dump) => {
      const lat = dump.lat || dump.latitude;
      const lng = dump.long || dump.lng || dump.longitude;
      
      if (!lat || !lng) {
        console.warn('⚠️ Garbage dump missing coordinates:', dump);
        return;
      }

      const marker = L.marker([parseFloat(lat), parseFloat(lng)], { 
        icon: blueIcon 
      }).addTo(mapRef.current);

      marker.bindTooltip(dump.name || 'Garbage Dump', {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip',
      });

      marker.on('click', () => {
        if (myLocation) {
          calculateRoute(myLocation.lat, myLocation.lng, parseFloat(lat), parseFloat(lng), null);
        }
      });

      garbageMarkersRef.current.push(marker);
    });
    
  }, [garbageDumps, myLocation]);

  const uniquePickupLocations = Array.from(
    new Map(pickupLocations.map((l) => [l.id, l])).values()
  );

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    userMarkersRef.current.forEach(marker => {
      if (mapRef.current && marker) {
        mapRef.current.removeLayer(marker);
      }
    });
    userMarkersRef.current = [];

    pickupLocations.forEach((loc) => {
      const lat = loc.lat;
      const lng = loc.long || loc.lng;
      
      if (!lat || !lng) {
        console.warn('⚠️ Active pickup missing coordinates:', loc);
        return;
      }

      const marker = L.marker([parseFloat(lat), parseFloat(lng)], { 
        icon: yellowIcon 
      }).addTo(mapRef.current);
      
      marker.bindTooltip(`🚮 Pickup Request - ${loc.name || loc.locationName || 'Location'}`, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip pickup-tooltip',
      });

      marker.on('click', () => {
        if (myLocation) {
          calculateRoute(myLocation.lat, myLocation.lng, parseFloat(lat), parseFloat(lng), {
            id: loc.id,
            name: loc.name || loc.locationName,
            userId: loc.userId,
            ...loc
          });
        }
      });

      userMarkersRef.current.push(marker);
    });
    
  }, [myLocation, pickupLocations]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (driverMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(driverMarkerRef.current);
      }
      clearRouteElements();
      userMarkersRef.current.forEach(marker => {
        if (mapRef.current && marker) {
          mapRef.current.removeLayer(marker);
        }
      });
      garbageMarkersRef.current.forEach(marker => {
        if (mapRef.current && marker) {
          mapRef.current.removeLayer(marker);
        }
      });
    };
  }, []);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        <div className="text-gray-700">
          {myLocation ? (
            <>
              <span className="font-semibold">🚛 Driver Location:</span> 
              {' '}{myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}
            </>
          ) : (
            <span className="text-yellow-600">📍 Fetching location...</span>
          )}
        </div>
        <div className="flex gap-2">
          {loadingRoute && (
            <span className="text-blue-600 animate-pulse">🔄 Calculating route...</span>
          )}
          <button
            onClick={clearRoute}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
            disabled={loadingRoute}
          >
            🗑️ Clear Route
          </button>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{uniquePickupLocations.length}</div>
          <div className="text-xs text-gray-600">Active Pickups</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{garbageDumps?.length || 0}</div>
          <div className="text-xs text-gray-600">Garbage Dumps</div>
        </div>
      </div>
      
      <div
        id="driver-map"
        className="rounded-2xl shadow-lg border border-gray-300 flex-grow"
        style={{ height: '100%', minHeight: '70vh', width: '100%' }}
      />
      
      <div className="mt-4 text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Driver Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Garbage Dumps ({garbageDumps?.length || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>User Pickup Requests ({uniquePickupLocations.length})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-300 rounded-full mr-2"></div>
            <span>Route Path</span>
          </div>
          
          <div className="flex items-center ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-green-600">Real-time Active</span>
          </div>
          
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>💡 <strong>How to use:</strong></p>
            <p>• Click on any <span className="text-yellow-600 font-semibold">yellow marker</span> to see route to user's pickup location</p>
            <p>• Click on any <span className="text-blue-600 font-semibold">blue marker</span> to see route to garbage dump</p>
            <p>• After collecting garbage, click "Complete Pickup" to remove it from map</p>
            <p>• New pickup requests appear automatically - no refresh needed!</p>
            {pickupLocations.length > 0 && (
              <p className="text-green-600 mt-1">✨ {pickupLocations.length} active pickup request(s) waiting!</p>
            )}
            {(!garbageDumps || garbageDumps?.length === 0) && (
              <p className="text-red-600 mt-1">⚠️ No garbage dumps found in database. Please add some garbage locations.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .pulse-marker {
          animation: pulse 1.5s infinite;
        }
        .custom-tooltip {
          background-color: white;
          color: black;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 1px solid #e5e7eb;
          font-size: 12px;
        }
        .pickup-tooltip {
          border-left: 3px solid #eab308;
        }
      `}</style>
    </div>
  );
};

export default DriverLeafletMap;