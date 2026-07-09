import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { Card, CardContent, Typography, Box } from "@mui/material";
import styled, { keyframes } from "styled-components";
import defaultProfile from "../../assets/images/default-profile.png";
import coin1 from "../../assets/images/coin1.png";
import coin2 from "../../assets/images/coin2.png";

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

const FallingCoin = styled.div`
  position: absolute;
  animation: ${fall} ${(props) => props.$duration || "3s"} linear infinite;
  animation-delay: ${(props) => props.$delay || "0s"};
  left: ${(props) => props.$left || "50%"};
  z-index: 1;
`;

const COIN_IMAGES = [coin1, coin2];
const TOTAL_COINS = 8;

export default function UserProfile() {
  
  const navigate = useNavigate();
  
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-400 text-lg">
          You are not logged in or your session has expired.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const generateCoins = () => {
    const coins = [];
    
    for (let i = 0; i < TOTAL_COINS; i++) {
      coins.push(
        <FallingCoin
          key={i}
          $delay={`${Math.random() * 2}s`}
          $duration={`${2 + Math.random() * 3}s`}
          $left={`${10 + Math.random() * 80}%`}
        >
          <img
            src={COIN_IMAGES[Math.floor(Math.random() * COIN_IMAGES.length)]}
            alt="Coin"
            style={{ width: "20px", height: "20px" }}
          />
        </FallingCoin>
      );
    }
    return coins;
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
          onClick={() => navigate("/editProfile")}
          className="absolute top-5 right-5 p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg hover:shadow-purple-500/50 z-10 cursor-pointer"
        >
          <FaEdit size={18} />
        </button>

        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-400 shadow-[0_0_25px_rgba(156,39,176,0.6)]">
            <img
              src={user?.profilePicture || defaultProfile}
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