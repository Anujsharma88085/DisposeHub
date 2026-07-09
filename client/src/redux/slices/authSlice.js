import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../actions/authActions";
import { connectSocket, disconnectSocket } from "../../socket/socket";

const initialState = {
  user: null,
  authLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      connectSocket();
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

  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      disconnectSocket();
      return {
        ...initialState,
        authLoading: false,
      };
    });
  },
});

export const { loginSuccess, updateUser, updateWallet, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
