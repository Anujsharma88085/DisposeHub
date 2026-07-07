import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
  },
});

export default store;
