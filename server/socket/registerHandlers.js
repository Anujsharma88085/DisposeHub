import registerLocationHandlers from "./handlers/location.handler.js";
import registerNotificationHandlers from "./handlers/notification.handler.js";
import registerLeaderboardHandlers from "./handlers/leaderboard.handler.js";

const registerHandlers = (io, socket) => {
  registerLocationHandlers(io, socket);
  registerNotificationHandlers(io, socket);
  registerLeaderboardHandlers(io, socket);
};

export default registerHandlers;