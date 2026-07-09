import http from "http";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { Server as SocketIOServer } from "socket.io";

import connectDB from "./config/db.js";
import initializeSocket from "./socket/index.js";
import app from "./index.js";


const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  allowEIO3: true,
});

/* ================= START SERVER ================= */
const startServer = async () => {
  await connectDB();

  initializeSocket(io);

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    } else {
      console.log(`🚀 Server running on port ${PORT}`);
    }
  });
};

startServer();