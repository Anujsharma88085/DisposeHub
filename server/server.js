import http from "http";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
// import jwt from "jsonwebtoken";
// import cookie from "cookie";

import connectDB from "./config/db.js";
// import initLeaderboardSocket from "./leaderBoardSocket.js";
// import initSocket from "./mapSocket.js";
// import setupSocketAuth from "./socket/auth.js";
import initializeSocket from "./socket/index.js";
import app from "./index.js";

dotenv.config({ path: "./.env" });

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
  allowEIO3: true, // For compatibility
});

/* ================= SOCKET AUTH MIDDLEWARE ================= */
// io.use((socket, next) => {
//   try {
//     const cookies = socket.handshake.headers.cookie;
//     if (!cookies) {
//       console.log("No cookies found, allowing connection without auth");
//       socket.userId = "anonymous";
//       return next();
//     }

//     const token = cookie.parse(cookies).jwt;
//     if (!token) {
//       console.log("No JWT token found, allowing connection without auth");
//       socket.userId = "anonymous";
//       return next();
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded.id;
//     console.log("Authenticated user:", socket.userId);
//     next();
//   } catch (err) {
//     console.log("Auth error:", err.message);
//     socket.userId = "anonymous";
//     next(); // Allow connection even without auth for public features
//   }
// });


/* ================= START SERVER ================= */
const startServer = async () => {
  await connectDB();

  // initSocket(io);
  // initLeaderboardSocket(io);
  initializeSocket(io);

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();