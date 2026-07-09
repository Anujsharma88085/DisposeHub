import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import leaderboardReducer from "./slices/leaderboardSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    leaderboard: leaderboardReducer,
  },
});

export default store;
