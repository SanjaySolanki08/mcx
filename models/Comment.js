const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tip: { type: mongoose.Schema.Types.ObjectId, ref: 'Tip', required: true },
  createdAt: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
});

module.exports = mongoose.model('Comment', commentSchema);
