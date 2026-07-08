import api from './api'

export const getLeaderboard = async (role) => {

    const res = await api.get(
        `/api/v1/leaderboard?role=${role}`
    );

    return res.data;
};