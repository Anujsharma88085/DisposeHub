import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { getMe } from "../../apis/userApi";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useSpring, animated, config } from "react-spring";
import styled, { keyframes } from "styled-components";

const fall = keyframes`
  0% {
    top: -20px;
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
`;

const grow = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled components for animations
const FallingCoin = styled(animated.div)`
  position: absolute;
  animation: ${fall} ${props => props.duration || '3s'} linear infinite;
  animation-delay: ${props => props.delay || '0s'};
  left: ${props => props.left || '50%'};
  z-index: 1;
`;

const GrowingTreeContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
`;

const Tree = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('https://cdn-icons-png.flaticon.com/512/477/477033.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  animation: ${grow} 1.5s ease-out forwards, ${pulse} 3s ease-in-out infinite;
`;

export default function UserProfile() {
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      if(userData)
        setUser(userData);
    } catch (error) {
      console.error(error);

      // If unauthorized → go to login
      if (error?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400 text-lg">
          You are not logged in or your session has expired.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Generate falling coins with random properties
  const generateCoins = () => {
    const coins = [];
    const coinImages = [
      'https://cdn-icons-png.flaticon.com/512/272/272525.png',
      'https://cdn-icons-png.flaticon.com/512/3132/3132693.png',
      'https://cdn-icons-png.flaticon.com/512/477/477029.png'
    ];
    
    for (let i = 0; i < 8; i++) {
      coins.push(
        <FallingCoin
          key={i}
          delay={`${Math.random() * 2}s`}
          duration={`${2 + Math.random() * 3}s`}
          left={`${10 + Math.random() * 80}%`}
        >
          <img
            src={coinImages[Math.floor(Math.random() * coinImages.length)]}
            alt="Coin"
            style={{ width: "20px", height: "20px" }}
          />
        </FallingCoin>
      );
    }
    return coins;
  };

  // Tree growing animation based on points
  const GrowingTree = () => {
    const points = user?.points || 0;
    let treeSize = '60px';
    
    if (points > 1000) treeSize = '100px';
    else if (points > 500) treeSize = '90px';
    else if (points > 200) treeSize = '80px';
    else if (points > 50) treeSize = '70px';

    return (
      <GrowingTreeContainer>
        <Tree style={{ width: treeSize, height: treeSize }} />
      </GrowingTreeContainer>
    );
  };


  return (
    <div
      className="flex items-center justify-center gap-8 p-8 min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #2D0035, #150050)" }}
    >
      {/* Profile Section */}
      <div className="w-full md:w-2/4 bg-white/10 backdrop-blur-xl border border-purple-400/40 shadow-[0_0_40px_rgba(156,39,176,0.25)] rounded-3xl p-8 relative overflow-hidden">

        {/* Edit Button */}
        <button
          onClick={() => navigate("/editProfile", { state: { user } })}
          className="absolute top-5 right-5 p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg hover:shadow-purple-500/50 z-10 cursor-pointer"
        >
          <FaEdit size={18} />
        </button>

        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-[0_0_25px_rgba(156,39,176,0.6)]">
            <img
              src={user?.profilePicture || "/cop.jpg"}
              alt="Profile"
              className="w-full h-full object-cover object-center scale-150"
            />
          </div>
        </div>

        {/* User Info */}
        <h2 className="mt-5 text-4xl font-extrabold text-purple-300 text-center tracking-wide">
          {user.name}
        </h2>
        <p className="text-center text-gray-300 mt-1">{user.email}</p>

        {/* Points & Wallet */}
        <Box mt={6} display="flex" justifyContent="center" alignItems="center" gap={4}>
          {/* Points */}
          <Card
            sx={{
              width: 200,
              height: 180,
              textAlign: "center",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              borderRadius: "24px",
              border: "1px solid rgba(156,39,176,0.4)",
              boxShadow: "0 0 25px rgba(156,39,176,0.25)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#D1B3FF", fontWeight: 800, letterSpacing: "0.5px" }}
            >
              Points
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: "bold",
                color: "#fff",
                textShadow: "0 0 12px rgba(156,39,176,0.8)",
              }}
            >
              {user.points ?? "0"}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ color: "#D1B3FF80", mt: 1 }}
            >
              Total earned points
            </Typography>
          </Card>



          {/* Wallet */}
          <Card
            sx={{
              width: 200,
              height: 180,
              textAlign: "center",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              borderRadius: "24px",
              border: "1px solid rgba(156,39,176,0.4)",
              boxShadow: "0 0 25px rgba(156,39,176,0.25)",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => navigate("/withdrawl-money")}
          >
            {generateCoins()}
            <CardContent
              style={{ position: "relative", zIndex: 2 }}
            >
              <Typography variant="h6" sx={{ color: "#D1B3FF", fontWeight: 600 }}>
                Wallet Balance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                ₹{user.walletBalance?.toFixed(2) ?? "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Transactions Button */}
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => navigate("/transactions")}
            className="px-10 py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer"
          >
            View Your Transactions
          </button>
        </div>
      </div>
    </div>
  );
}