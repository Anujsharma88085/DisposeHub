import { createSlice } from "@reduxjs/toolkit";

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
});

export const { setLoading, setLeaderboard } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;