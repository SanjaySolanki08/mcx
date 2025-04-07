const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  shares: { type: Number, default: 0 },
  createdAt: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Category collection
    ref: "Category",
    required: true, // Every tip must link to a category
  },
});

module.exports = mongoose.model("Tip", tipSchema);
