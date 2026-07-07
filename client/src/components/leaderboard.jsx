import React, { useState, useEffect } from 'react';
import { getSocket } from "../socket/socket";
import {
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { getLeaderboard } from '../apis/leaderboardApi';
import {
  setLeaderboard,
  setLoading,
} from "../redux/slices/leaderboardSlice";
import { EVENTS } from '../socket/events';

const Leaderboard = () => {
  const [selectedRole, setSelectedRole] = useState("user");
  const dispatch = useDispatch();

  const { leaderboard, loading } = useSelector(
      (state) => state.leaderboard
  );

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        dispatch(setLoading(true));

        const data = await getLeaderboard(selectedRole);

        dispatch(setLeaderboard(data.leaderboard));
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchLeaderboard();
  }, [dispatch, selectedRole]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleLeaderboardUpdate = async () => {
        try {
            dispatch(setLoading(true));

            const data = await getLeaderboard(selectedRole);

            dispatch(setLeaderboard(data.leaderboard));
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    socket.on(EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);

    return () => {
        socket.off(EVENTS.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    };
  }, [dispatch, selectedRole]);

  const sortedUsers = leaderboard;

  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          backgroundColor: "#00ff48",
          color: "#000",
        };

      case 1:
        return {
          backgroundColor: "#1e956f",
          color: "#000",
        };

      case 2:
        return {
          backgroundColor: "#0e7c90",
          color: "#fff",
        };

      default:
        return {
          backgroundColor: "#334155",
          color: "#E2E8F0",
        };
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      color: '#fff',
      py: 6,
      px: 2
    }}>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{
              fontWeight: 700,
              color: "#F8FAFC",
              letterSpacing: 1,
              mb: 4,
          }}>
          {selectedRole === "user"
            ? "🌱 Eco Users Leaderboard"
            : "🚛 Driver Leaderboard"
          }
        </Typography>
      </motion.div>

      <Box
          sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
          }}
      >
          <Tabs
              value={selectedRole}
              onChange={(event, value) => setSelectedRole(value)}
              textColor="inherit"
              indicatorColor="secondary"
          >
              <Tab
                  value="user"
                  label="Eco Users"
              />

              <Tab
                  value="driver"
                  label="Drivers"
              />
          </Tabs>
      </Box>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress sx={{ color: '#BB86FC' }} />
          </Box>
        ) : sortedUsers.length === 0 ? (
          <Typography align="center" mt={6} sx={{ color: '#BB86FC' }}>
            No users available on the leaderboard yet.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{
            maxWidth: 1000,
            mx: 'auto',
            borderRadius: 4,
            backdropFilter: 'blur(12px)',
            backgroundColor: "#1E293B",
            border: "1px solid #334155",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            overflowX: 'auto'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0F172A" }}>
                  <TableCell sx={{ color: "#38BDF8", fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ color: "#38BDF8", fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: "#38BDF8", fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: "#38BDF8", fontWeight: 'bold' }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          ...getRankStyle(index),
                          px: 2,
                          py: 0.8,
                          borderRadius: 2,
                          fontWeight: 700,
                          textAlign: "center",
                          minWidth: 48,
                          boxShadow:
                            index < 3
                              ? "0 0 12px rgba(255,255,255,0.25)"
                              : "none",
                        }}
                      >
                        {index === 0
                          ? `🥇 ${index + 1}`
                          : index === 1
                          ? `🥈 ${index + 1}`
                          : index === 2
                          ? `🥉 ${index + 1}`
                          : index + 1}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.profilePicture} alt={user.name} />
                        <Typography sx={{ color: 'white' }} fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'white' }}>{user.email}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: "#22C55E" }}>{user.points}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </motion.div>
    </Box>
  );
};

export default Leaderboard;
