import { createSlice } from "@reduxjs/toolkit";
import { connectSocket, disconnectSocket } from "../../socket/socket";

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      connectSocket();
    },
    logout: (state) => {
      state.user = null;
      disconnectSocket();
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateWallet: (state, action) => {
      if (state.user) {
        state.user.walletBalance = action.payload;
      }
    },
  },
});

export const { loginSuccess, logout, updateUser, updateWallet } = authSlice.actions;
export default authSlice.reducer;
