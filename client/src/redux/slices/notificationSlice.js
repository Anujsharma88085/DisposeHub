import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../actions/authActions";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.loading = false;
    },

    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },

    markAllAsRead: (state) => {
      state.unreadCount = 0;

      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
    },
  },

  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  setLoading,
  setNotifications,
  addNotification,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;