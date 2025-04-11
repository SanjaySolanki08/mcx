const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tip: { type: mongoose.Schema.Types.ObjectId, ref: 'Tip', required: true },
  createdAt: { 
    type: Date, 
    default: Date.now // Store in UTC
    
  },
});

module.exports = mongoose.model('Comment', commentSchema);
