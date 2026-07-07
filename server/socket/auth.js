import jwt from "jsonwebtoken";
import cookie from "cookie";

const setupSocketAuth = (io) => {
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("Authentication required"));
      }

      const token = cookie.parse(cookies).jwt;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });
};

export default setupSocketAuth;