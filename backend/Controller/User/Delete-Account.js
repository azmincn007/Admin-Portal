const User = require('../../model/UserSchema');
const AdListing = require('../../model/AdListingScema');

/**
 * Controller to delete user account and related data
 * Returns impact details after successful deletion
 */
const deleteAccount = async (req, res) => {
  // Start a session for transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId; // Assuming this comes from auth middleware

    // First, find the user to make sure they exist
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      // 1. Find and store ads info before deletion for impact report
      const userAds = await AdListing.find({ userId: userId });
      const adIds = userAds.map(ad => ad._id);

      // 2. Find how many users were affected (had these ads in favorites)
      const affectedUsers = await User.find(
        { favorites: { $in: adIds } },
        { _id: 1, email: 1 }
      );

      // 3. Delete all ads created by this user
      await AdListing.deleteMany({ userId: userId }, { session });

      // 4. Remove these ads from other users' favorites
      await User.updateMany(
        { favorites: { $in: adIds } },
        { $pull: { favorites: { $in: adIds } } },
        { session }
      );

      // 5. Delete the user
      await User.findByIdAndDelete(userId, { session });

      // If everything succeeded, commit the transaction
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
        deletionImpact: {
          accountDeleted: {
            userId: user._id,
            email: user.email
          },
          adsDeleted: {
            count: userAds.length,
            adIds: adIds
          },
          favoritesImpact: {
            usersAffected: affectedUsers.length,
            affectedUserEmails: affectedUsers.map(u => u.email)
          }
        }
      });

    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      throw error;
    }

  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

module.exports = { deleteAccount };