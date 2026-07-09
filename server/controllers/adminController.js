import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import catchAsync from '../utils/catchAsync.js';

const adminController = {
  distributeRewards :catchAsync(async (req, res, next) => {
    const users = await User.find();
  
    for (let user of users) {
      try {
        const amount = user.points;
        if (amount >= 200) {
          user.walletBalance += amount;
          user.points = 0;
          await user.save({ validateBeforeSave: false });
         
          await Transaction.create({
            user: user._id,
            amount,
            type: 'reward',
          });
        }
      } catch (err) {
        console.error(`Error processing user ${user._id}:`, err);
      }
    }
  
    res.status(200).json({
      status: 'success',
      message: 'Rewards distributed to all users'
    });
  })
};

export default adminController;

