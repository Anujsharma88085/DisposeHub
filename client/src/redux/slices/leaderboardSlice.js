import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../actions/authActions";

const initialState = {
  leaderboard: [],
  loading: false,
};

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  }
});

export const { setLoading, setLeaderboard } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;