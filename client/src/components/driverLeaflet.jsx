import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

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

const DriverLeafletMap = ({ driver, locations, setLocations, garbageDumps, activePickupLocations }) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const routeInfoControlRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [socketPickupLocations, setSocketPickupLocations] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [notification, setNotification] = useState(null);
  const [completedPickups, setCompletedPickups] = useState([]);
  const userMarkersRef = useRef([]);
  const garbageMarkersRef = useRef([]);
  const notificationTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const locationWatchIdRef = useRef(null);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Initialize socket with real-time updates
  useEffect(() => {
    const socketUrl = 'http://localhost:3000';
    
    const initSocket = async () => {
      try {
        const socketIo = (await import('socket.io-client')).default;
        const newSocket = socketIo(socketUrl, {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        
        newSocket.on('connect', () => {
          console.log('✅ Driver socket connected');
          setConnectionStatus('connected');
          showNotification('Connected to real-time server', 'success');
          
          newSocket.emit('driver-connect', { 
            driverId: driver?.id || 'driver',
            timestamp: new Date().toISOString()
          });
          
          // Request immediate location refresh
          newSocket.emit('refresh-locations');
        });
        
        newSocket.on('connect_error', (error) => {
          console.error('❌ Driver socket connection error:', error);
          setConnectionStatus('error');
          showNotification('Connection to real-time server failed', 'error');
        });
        
        newSocket.on('disconnect', (reason) => {
          console.log('🔌 Driver socket disconnected:', reason);
          setConnectionStatus('disconnected');
          showNotification('Disconnected from real-time server', 'warning');
        });
        
        // Immediate pickup location updates
        newSocket.on('existing-pickup-locations', (locations) => {
          console.log('📦 Existing pickup locations from socket:', locations?.length || 0);
          if (Array.isArray(locations)) {
            const formattedLocations = locations.map(loc => ({
              ...loc,
              id: loc.id,
              lat: loc.lat,
              lng: loc.long || loc.lng,
              long: loc.long || loc.lng,
              name: loc.name || loc.locationName,
              locationName: loc.locationName || loc.name,
              active: true
            }));
            setSocketPickupLocations(formattedLocations);
            if (setLocations) {
              setLocations(formattedLocations);
            }
            if (locations.length > 0) {
              showNotification(`${locations.length} active pickup requests available`, 'info');
            }
          }
        });
        
        newSocket.on('new-pickup-location', (pickupLocation) => {
          console.log('🆕 New pickup location received INSTANTLY:', pickupLocation);
          const formattedLocation = {
            ...pickupLocation,
            id: pickupLocation.id,
            lat: pickupLocation.lat,
            lng: pickupLocation.long || pickupLocation.lng,
            long: pickupLocation.long || pickupLocation.lng,
            name: pickupLocation.name || pickupLocation.locationName,
            locationName: pickupLocation.locationName || pickupLocation.name,
            active: true
          };
          
          setSocketPickupLocations(prev => {
            if (prev.some(loc => loc.id === formattedLocation.id)) return prev;
            return [formattedLocation, ...prev];
          });
          
          if (setLocations) {
            setLocations(prev => {
              if (prev.some(loc => loc.id === formattedLocation.id)) return prev;
              return [formattedLocation, ...prev];
            });
          }
          
          showNotification(`New pickup request received instantly!`, 'info');
        });
        
        newSocket.on('pickup-location-removed', (pickupId) => {
          console.log('🗑️ Pickup location removed INSTANTLY:', pickupId);
          
          setSocketPickupLocations(prev => prev.filter(loc => loc.id !== pickupId));
          
          if (setLocations) {
            setLocations(prev => prev.filter(loc => loc.id !== pickupId));
          }
          
          if (endMarkerRef.current && endMarkerRef.current.options && 
              endMarkerRef.current.options.pickupId === pickupId) {
            clearRouteElements();
          }
          
          showNotification('A pickup request was completed', 'success');
        });
        
        socketRef.current = newSocket;
        setSocket(newSocket);
      } catch (err) {
        console.error('Failed to load socket.io-client:', err);
        setConnectionStatus('error');
        showNotification('Failed to initialize real-time features', 'error');
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('new-pickup-location');
        socketRef.current.off('existing-pickup-locations');
        socketRef.current.off('pickup-location-removed');
        socketRef.current.disconnect();
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [driver?.id, setLocations]);

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
    if (!mapRef.current) return;

    // Initial location fetch and setup watch position
    const startWatchingLocation = () => {
      if (navigator.geolocation) {
        // First get current position
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setLocation(coords);
            
            const locationData = {
              driverId: driver?.id || 'driver',
              lat: coords.lat,
              lng: coords.lng,
              timestamp: new Date().toISOString()
            };
            
            if (socketRef.current && connectionStatus === 'connected') {
              socketRef.current.emit('driver-location', locationData);
            }

            if (driverMarkerRef.current && mapRef.current) {
              driverMarkerRef.current.setLatLng([coords.lat, coords.lng]);
              driverMarkerRef.current.getPopup()?.setContent(`
                <b>🚛 Driver Location</b><br/>
                Last updated: ${new Date().toLocaleTimeString()}<br/>
                Status: ${connectionStatus === 'connected' ? 'Online' : 'Offline'}
              `);
            } else if (mapRef.current) {
              driverMarkerRef.current = L.marker([coords.lat, coords.lng], { 
                icon: redIcon 
              })
                .addTo(mapRef.current)
                .bindPopup(`
                  <b>🚛 Driver Location</b><br/>
                  Last updated: ${new Date().toLocaleTimeString()}<br/>
                  Status: ${connectionStatus === 'connected' ? 'Online' : 'Offline'}
                `)
                .openPopup();
            }

            if (mapRef.current && !isZooming && !polylineRef.current && !localStorage.getItem('manualZoom')) {
              setIsZooming(true);
              mapRef.current.flyTo([coords.lat, coords.lng], 15, {
                duration: 1,
                onEnd: () => setIsZooming(false)
              });
            }
          },
          (err) => {
            console.error('Geolocation error:', err);
            showNotification('Unable to get your location. Please enable GPS.', 'error');
            const defaultCoords = { lat: 20.59, lng: 78.96 };
            setLocation(defaultCoords);
            if (socketRef.current && connectionStatus === 'connected') {
              socketRef.current.emit('driver-location', {
                driverId: driver?.id || 'driver',
                lat: defaultCoords.lat,
                lng: defaultCoords.lng,
                timestamp: new Date().toISOString()
              });
            }
            
            if (mapRef.current && !driverMarkerRef.current) {
              driverMarkerRef.current = L.marker([defaultCoords.lat, defaultCoords.lng], { 
                icon: redIcon 
              })
                .addTo(mapRef.current)
                .bindPopup('<b>🚛 Driver Location (Approximate)</b>');
            }
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );

        // Then watch for continuous updates
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setLocation(coords);
            
            const locationData = {
              driverId: driver?.id || 'driver',
              lat: coords.lat,
              lng: coords.lng,
              timestamp: new Date().toISOString()
            };
            
            if (socketRef.current && connectionStatus === 'connected') {
              socketRef.current.emit('driver-location', locationData);
            }

            if (driverMarkerRef.current && mapRef.current) {
              driverMarkerRef.current.setLatLng([coords.lat, coords.lng]);
              driverMarkerRef.current.getPopup()?.setContent(`
                <b>🚛 Driver Location</b><br/>
                Last updated: ${new Date().toLocaleTimeString()}<br/>
                Status: ${connectionStatus === 'connected' ? 'Online' : 'Offline'}
              `);
            }
          },
          (err) => {
            console.error('Geolocation watch error:', err);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        
        locationWatchIdRef.current = watchId;
        return watchId;
      } else {
        showNotification('Geolocation is not supported by your browser', 'error');
        const defaultCoords = { lat: 20.59, lng: 78.96 };
        setLocation(defaultCoords);
        
        if (mapRef.current && !driverMarkerRef.current) {
          driverMarkerRef.current = L.marker([defaultCoords.lat, defaultCoords.lng], { 
            icon: redIcon 
          })
            .addTo(mapRef.current)
            .bindPopup('<b>🚛 Driver Location (Default)</b>');
        }
      }
      return null;
    };

    startWatchingLocation();
    
    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, [connectionStatus, isZooming, driver?.id]);

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
    
    localStorage.removeItem('manualZoom');
  };

  const clearRoute = () => {
    clearRouteElements();
    showNotification('Route cleared', 'info');
  };

  useEffect(() => {
    clearRouteElements();
  }, [locations]);

  const completePickup = async (pickupId, pickupLocation) => {
    if (socketRef.current && window.confirm(`Mark this pickup as completed?\n\nLocation: ${pickupLocation?.name || pickupLocation?.locationName || 'Pickup Location'}`)) {
      
      try {
        const response = await fetch(`http://localhost:3000/api/v1/location/${pickupId}/deactivate`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          console.log('Location deactivated in backend');
          if (setLocations) {
            setLocations(prev => prev.filter(loc => loc.id !== pickupId && loc._id !== pickupId));
          }
        } else {
          console.error('Failed to deactivate location:', response.status);
        }
      } catch (error) {
        console.error('Failed to deactivate location:', error);
      }
      
      socketRef.current.emit('complete-pickup', pickupId);
      setSocketPickupLocations(prev => prev.filter(loc => loc.id !== pickupId));
      setCompletedPickups(prev => [...prev, { ...pickupLocation, completedAt: new Date().toISOString() }]);
      clearRouteElements();
      showNotification('✅ Garbage pickup completed successfully!', 'success');
      
      setTimeout(() => {
        setCompletedPickups(prev => prev.filter(p => p.id !== pickupId));
      }, 5000);
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

        localStorage.setItem('manualZoom', 'true');
        
        setIsZooming(true);
        const bounds = L.latLngBounds(coordinates);
        mapRef.current.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15,
          duration: 1,
          onEnd: () => setIsZooming(false)
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
              showNotification('Route cleared', 'info');
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
        
        showNotification(`Route calculated: ${distance} km, ${duration} minutes`, 'success');

      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      showNotification('Failed to calculate route. Using straight line.', 'warning');
      
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
      console.log('Map not ready yet');
      return;
    }

    console.log('🎨 Rendering static garbage dumps. garbageDumps:', garbageDumps);
    
    // Clear existing markers
    garbageMarkersRef.current.forEach(marker => {
      if (mapRef.current && marker) {
        mapRef.current.removeLayer(marker);
      }
    });
    garbageMarkersRef.current = [];

    // Check if garbageDumps has data
    const garbageData = garbageDumps?.data || [];
    
    if (garbageData.length === 0) {
      console.log('⚠️ No static garbage dumps to display');
    } else {
      console.log(`Found ${garbageData.length} static garbage dumps to render`);
    }

    garbageData.forEach((dump, index) => {
      const lat = dump.lat || dump.latitude;
      const lng = dump.long || dump.lng || dump.longitude;
      
      console.log(`Processing dump ${index}:`, { lat, lng, name: dump.name });
      
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
        if (location) {
          console.log('📍 Clicked on garbage dump:', dump.name);
          calculateRoute(location.lat, location.lng, parseFloat(lat), parseFloat(lng), null);
        } else {
          showNotification('Please wait for location to load', 'warning');
        }
      });

      garbageMarkersRef.current.push(marker);
    });
    
    console.log(`✅ Rendered ${garbageMarkersRef.current.length} static garbage dump markers`);
  }, [garbageDumps, location]);

  // Combine both API locations and socket locations for rendering
  const allPickupLocations = [...(activePickupLocations || []), ...socketPickupLocations];
  // Remove duplicates by id
  const uniquePickupLocations = allPickupLocations.filter((loc, index, self) => 
    index === self.findIndex((l) => l.id === loc.id)
  );

  // Active pickup locations markers (yellow markers from both API and socket)
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map not ready for active pickups');
      return;
    }

    console.log('🎨 Rendering active pickup locations. Count:', uniquePickupLocations.length);
    
    // Clear existing user markers
    userMarkersRef.current.forEach(marker => {
      if (mapRef.current && marker) {
        mapRef.current.removeLayer(marker);
      }
    });
    userMarkersRef.current = [];

    if (uniquePickupLocations.length === 0) {
      console.log('⚠️ No active pickup locations to display');
      return;
    }

    console.log(`Found ${uniquePickupLocations.length} active pickup locations to render`);

    uniquePickupLocations.forEach((loc, index) => {
      const lat = loc.lat;
      const lng = loc.long || loc.lng;
      
      console.log(`Processing active pickup ${index}:`, { lat, lng, name: loc.name });
      
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
        if (location) {
          console.log('📍 Clicked on active pickup:', loc.name);
          calculateRoute(location.lat, location.lng, parseFloat(lat), parseFloat(lng), {
            id: loc.id,
            name: loc.name || loc.locationName,
            userId: loc.userId,
            ...loc
          });
        } else {
          showNotification('Please wait for location to load', 'warning');
        }
      });

      userMarkersRef.current.push(marker);
    });
    
    console.log(`✅ Rendered ${userMarkersRef.current.length} active pickup markers`);
  }, [uniquePickupLocations, location]);

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
      {notification && (
        <div className={`fixed top-4 right-4 z-[2000] p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          notification.type === 'warning' ? 'bg-yellow-500' :
          'bg-blue-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
      
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        <div className="text-gray-700">
          {location ? (
            <>
              <span className="font-semibold">🚛 Driver Location:</span> 
              {' '}{location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className="ml-1 text-xs text-gray-500">
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
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
      
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{uniquePickupLocations.length}</div>
          <div className="text-xs text-gray-600">Active Pickups</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{garbageDumps?.data?.length || 0}</div>
          <div className="text-xs text-gray-600">Garbage Dumps</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{completedPickups.length}</div>
          <div className="text-xs text-gray-600">Completed Today</div>
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
            <span>Garbage Dumps ({garbageDumps?.data?.length || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>User Pickup Requests ({uniquePickupLocations.length})</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-300 rounded-full mr-2"></div>
            <span>Route Path</span>
          </div>
          {connectionStatus === 'connected' && (
            <div className="flex items-center ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-600">Real-time Active</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>💡 <strong>How to use:</strong></p>
            <p>• Click on any <span className="text-yellow-600 font-semibold">yellow marker</span> to see route to user's pickup location</p>
            <p>• Click on any <span className="text-blue-600 font-semibold">blue marker</span> to see route to garbage dump</p>
            <p>• After collecting garbage, click "Complete Pickup" to remove it from map</p>
            <p>• New pickup requests appear automatically - no refresh needed!</p>
            {uniquePickupLocations.length > 0 && (
              <p className="text-green-600 mt-1">✨ {uniquePickupLocations.length} active pickup request(s) waiting!</p>
            )}
            {(!garbageDumps?.data || garbageDumps.data.length === 0) && (
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