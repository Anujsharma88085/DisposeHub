import React from 'react';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/system';
import LeafletMap from '../../components/LeafletMap';


const MapContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: "24px",
  backgroundColor: "#fff",
  boxShadow: "0px 4px 30px rgba(0,0,0,0.1)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

function Integrate() {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        background: 'linear-gradient(to bottom right, #f3f4f6, #dbeafe)',
      }}
    >
      <MapContainer elevation={4}>
        <LeafletMap />
      </MapContainer>
    </Box>
  );
}

export default Integrate;
