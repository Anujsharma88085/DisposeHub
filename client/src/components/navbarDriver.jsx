import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Divider, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import io from 'socket.io-client';
import { deactivateLocation } from "../apis/garbageApi";

const Sidebar = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(180deg, #2E3B55 0%, #1F2A40 100%)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  overflowY: 'auto',
  borderTopRightRadius: '24px',
  borderBottomRightRadius: '24px',
}));

const DriverNavbar = ({ locations = [], setLocations }) => {
  const [passed, setPassed] = useState({});
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [localLocations, setLocalLocations] = useState(locations);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Update local state when prop changes
  useEffect(() => {
    setLocalLocations(locations);
  }, [locations]);

  // Initialize socket for real-time updates
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
      console.log('✅ Navbar socket connected');
      setConnectionStatus('connected');
      showNotification('Connected to real-time server', 'success');
      
      // Identify as driver
      newSocket.emit('driver-connect', { 
        driverId: 'driver',
        timestamp: new Date().toISOString()
      });
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Navbar socket connection error:', error);
      setConnectionStatus('error');
    });
    
    newSocket.on('disconnect', () => {
      console.log('🔌 Navbar socket disconnected');
      setConnectionStatus('disconnected');
    });
    
    // Listen for new pickup locations from users
    newSocket.on('new-pickup-location', (pickupLocation) => {
      console.log('🆕 New pickup location received in navbar:', pickupLocation);
      setLocalLocations(prev => {
        if (prev.some(loc => loc._id === pickupLocation.id)) return prev;
        const newLocation = {
          _id: pickupLocation.id,
          id: pickupLocation.id,
          lat: pickupLocation.lat,
          long: pickupLocation.lng,
          lng: pickupLocation.lng,
          locationName: pickupLocation.name,
          name: pickupLocation.name,
          active: true,
          timestamp: pickupLocation.timestamp
        };
        return [newLocation, ...prev];
      });
      showNotification(`New pickup request received!`, 'info');
    });
    
    // Listen for pickup location removed (completed or cancelled)
    newSocket.on('pickup-location-removed', (pickupId) => {
      console.log('🗑️ Pickup location removed in navbar:', pickupId);
      setLocalLocations(prev => prev.filter(loc => loc._id !== pickupId));
      if (setLocations) {
        setLocations(prev => prev.filter(loc => loc._id !== pickupId));
      }
      showNotification('A pickup request was completed', 'success');
    });
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('disconnect');
        newSocket.off('new-pickup-location');
        newSocket.off('pickup-location-removed');
        newSocket.disconnect();
      }
    };
  }, [setLocations]);

  const handlePass = (Id) => {
    setPassed((prev) => ({ ...prev, [Id]: true }));
    showNotification('Task passed to another driver', 'info');
  };

  const handleTake = (name) => {
    showNotification(`You are going to complete task: ${name}`, 'success');
  };

  const handleThrown = async (id) => {
    const confirm = window.confirm("Have you thrown the garbage?");
    if (!confirm) return;

    try {
      await deactivateLocation(id);
      
      // Update local state
      setLocalLocations((prev) => prev.filter((loc) => loc._id !== id));
      if (setLocations) {
        setLocations((prev) => prev.filter((loc) => loc._id !== id));
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('complete-pickup', id);
      }
      
      showNotification('✅ Garbage pickup completed successfully!', 'success');
    } catch (error) {
      console.error("Failed to deactivate location:", error.message);
      showNotification('Failed to complete pickup', 'error');
    }
  };

  return (
    <Sidebar elevation={0}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[2000] p-3 rounded-lg shadow-lg text-white text-sm ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Connection Status Indicator */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: connectionStatus === 'connected' ? '#4ade80' : connectionStatus === 'connecting' ? '#fcd34d' : '#ef4444',
          animation: connectionStatus === 'connected' ? 'pulse 1.5s infinite' : 'none'
        }} />
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {connectionStatus === 'connected' ? 'Live' : 
           connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#fff',
          mb: 3,
        }}
      >
        Active Garbage Requests
      </Typography>

      <Typography variant="subtitle2" sx={{ mb: 2, color: '#fcd34d' }}>
        📍 User pickup requests ({localLocations.length})
      </Typography>

      {localLocations.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.6)' }}>
          No active pickup requests
        </Typography>
      ) : (
        localLocations.map((loc) => (
          <Box
            key={loc._id || loc.id}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: 3,
              mb: 3,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
              opacity: passed[loc._id] ? 0.5 : 1,
              pointerEvents: passed[loc._id] ? 'none' : 'auto',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationOnIcon sx={{ color: '#fcd34d' }} />
              <Typography variant="h6" fontWeight={600}>
                {loc.name || loc.locationName || 'Pickup Request'}
              </Typography>
            </Box>

            <Typography variant="body2">📍 Lat: {loc.lat}</Typography>
            <Typography variant="body2" mb={1}>
              📍 Lng: {loc.long || loc.lng}
            </Typography>

            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Requested: {loc.timestamp ? new Date(loc.timestamp).toLocaleTimeString() : 'Recently'}
            </Typography>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box display="flex" gap={1} flexWrap="wrap">
              <Tooltip title="Take Task">
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #8b5cf6, #a855f7)',
                    color: '#fff',
                    '&:hover': {
                      background: 'linear-gradient(to right, #7c3aed, #9333ea)',
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                  }}
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleTake(loc.name || loc.locationName)}
                >
                  Take
                </Button>
              </Tooltip>

              <Tooltip title="Pass Task">
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#e879f9',
                    color: '#f9a8d4',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                  }}
                  startIcon={<ClearIcon />}
                  onClick={() => handlePass(loc._id)}
                >
                  Pass
                </Button>
              </Tooltip>

              <Tooltip title="Mark Thrown">
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #ec4899, #db2777)',
                    color: '#fff',
                    '&:hover': {
                      background: 'linear-gradient(to right, #be185d, #9d174d)',
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                  }}
                  startIcon={<DeleteIcon />}
                  onClick={() => handleThrown(loc._id)}
                >
                  Thrown
                </Button>
              </Tooltip>
            </Box>
          </Box>
        ))
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Sidebar>
  );
};

export default DriverNavbar;