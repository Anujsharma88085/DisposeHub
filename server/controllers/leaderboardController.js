import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

export const getLeaderboard = catchAsync(async (req, res) => {

    const role = req.query.role || "user";

    const leaderboard = await User.find({
        role,
    })
    .select("name email profilePicture points")
    .sort({
        points: -1,
        createdAt: 1,
    })
    .limit(15);

    res.status(200).json({
        success: true,
        leaderboard,
    });

});