import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Box, Paper, Typography, Button, Divider, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { deactivateLocation } from "../apis/garbageApi";
import { showErrorToast } from '../utils/showErrorToast';
import { getSocket } from "../socket/socket";

const Sidebar = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: 'linear-gradient(180deg, #2E3B55 0%, #1F2A40 100%)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
  overflowY: 'auto',
  borderRadius: 0,
}));

const DriverNavbar = ({ locations = [], setLocations }) => {
  const socket = getSocket();

  const [connectionStatus, setConnectionStatus] = useState(() => {
      if (!socket) return "offline";
      return socket.connected ? "connected" : "connecting";
    }
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setConnectionStatus("connected");
    };

    const handleDisconnect = () => {
      setConnectionStatus("offline");
    };

    const handleReconnectAttempt = () => {
      setConnectionStatus("connecting");
    };

    const handleConnectError = () => {
      setConnectionStatus("connecting");
    };


    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError)
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [socket]);

  const handleThrown = async (id) => {
    const confirm = window.confirm("Have you thrown the garbage?");
    if (!confirm) return;

    try {
      await deactivateLocation(id);
    } catch (error) {
      if(import.meta.env.DEV){
        console.error("Failed to deactivate location:", error.message);
      }
      showErrorToast(error);
    }
  };

  const handlePass = (id) => {
    setLocations((prev) =>
      prev.filter((loc) => (loc._id || loc.id) !== id)
    );
  };

  return (
    <Sidebar elevation={0}>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          startIcon={<FaArrowLeft />}
          variant="text"
          sx={{
            color: "#fff",
            textTransform: "none",
            minWidth: "auto",
            px: 1,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.08)",
            },
          }}
        >
          Back
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor:
                connectionStatus === "connected"
                  ? "#4ade80"
                  : connectionStatus === "connecting"
                  ? "#fcd34d"
                  : "#ef4444",
              animation:
                connectionStatus === "connected"
                  ? "pulse 1.5s infinite"
                  : "none",
              flexShrink: 0,
            }}
          />

          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            {connectionStatus === "connected"
              ? "Live"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : "Offline"}
          </Typography>
        </Box>
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
        📍 User pickup requests ({locations.length})
      </Typography>

      {locations.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.6)' }}>
          No active pickup requests
        </Typography>
      ) : (
        locations.map((loc) => (
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
              Requested: {loc.updatedAt ? new Date(loc.updatedAt).toLocaleString() : 'Recently'}
            </Typography>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box display="flex" gap={4} flexWrap="wrap">
              <Tooltip title="Skip this request for now">
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  onClick={() => handlePass(loc._id || loc.id)}
                  sx={{
                    color: '#fbbf24',
                    borderColor: '#fbbf24',
                    textTransform: 'none',
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(251,191,36,0.08)',
                    },
                  }}
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
                  onClick={() => handleThrown(loc._id || loc.id)}
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