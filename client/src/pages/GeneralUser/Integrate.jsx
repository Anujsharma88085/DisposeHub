import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { logout } from "../../redux/actions/authActions";
import { useNavigate } from 'react-router-dom';
import LeafletMap from '../../components/LeafletMap';
import { logoutUser } from '../../apis/authApi';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import { styled } from '@mui/system';
import { showErrorToast } from '../../utils/showErrorToast';

/* =======================
   Sidebar
======================= */
const Sidebar = styled(Paper)(({ theme }) => ({
  width: '20%',
  minWidth: '200px',
  maxWidth: '300px',
  height: '100vh',

  background: 'linear-gradient(180deg, #2E3B55 0%, #1F2A40 100%)',
  color: '#fff',

  display: 'flex',
  flexDirection: 'column',

  padding: theme.spacing(2),
  boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
  borderTopRightRadius: '24px',
  borderBottomRightRadius: '24px',

  flexShrink: 0,
}));

/* =======================
   Sidebar Elements
======================= */
const SidebarTitle = styled(Typography)(({ theme }) => ({
  fontSize: '22px',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const SidebarButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontSize: '16px',
  padding: theme.spacing(1.5, 2),
  borderRadius: '12px',
  color: '#fff',

  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
}));

/* =======================
   Map Container
======================= */
const MapContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  margin: theme.spacing(2),
  padding: theme.spacing(2),

  height: 'calc(100vh - 32px)',
  borderRadius: '24px',

  backgroundColor: '#ffffff',
  boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
}));

/* =======================
   Main Component
======================= */
function Integrate() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser();

      dispatch(logout());

      navigate("/login");
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(to bottom right, #f3f4f6, #dbeafe)',
      }}
    >
      <Sidebar elevation={3}>
        <SidebarTitle
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          DisposeHub
        </SidebarTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SidebarButton onClick={() => navigate('/')}>Home</SidebarButton>
          <SidebarButton onClick={() => navigate('/dashboard')}>Dashboard</SidebarButton>
        </Box>

        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ mt: 'auto' }}>
          <SidebarButton
            color="error"
            onClick={handleLogout}
          >
            Logout
          </SidebarButton>
        </Box>
      </Sidebar>

      {/* ===== MAP ===== */}
      <MapContainer elevation={4}>
        <LeafletMap/>
      </MapContainer>
    </Box>
  );
}

export default Integrate;
