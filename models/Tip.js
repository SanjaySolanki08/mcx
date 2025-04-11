const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  shares: { type: Number, default: 0 },
  createdAt: { 
    type: Date, 
    default: Date.now // Store in UTC
    
  },
  sentiment: { 
    type: String, 
    enum: ['bullish', 'bearish', 'neutral'], 
    default: 'neutral' 
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Category collection
    ref: "Category",
    required: true, // Every tip must link to a category
  },
});

module.exports = mongoose.model("Tip", tipSchema);
