import api from './api'

export const getLeaderboard = async (role) => {

    const response = await api.get(
        `/api/v1/leaderboard?role=${role}`
    );

    return response.data;
};