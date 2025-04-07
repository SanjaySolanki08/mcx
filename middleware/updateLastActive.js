// middleware/updateLastActive.js
const User = require("../models/User");

const   updateLastActive = async (req, res, next) => {
  if (req.user && req.user._id) { // Assumes req.user is set by auth middleware
    try {
      await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
      console.log(`Updated lastActive for user ${req.user._id}`);
    } catch (error) {
      console.error("Error updating lastActive:", error);
    }
  }
  next();
};

module.exports = updateLastActive;
