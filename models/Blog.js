const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Stores full HTML content
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, required: true }, // Required main blog image
  createdAt: { 
    type: Date, 
    default: Date.now // Store in UTC
  },
  updatedAt: { 
    type: Date, 
    default: Date.now // Store in UTC
  },
  isPublished: { type: Boolean, default: true },
});

module.exports = mongoose.model("Blog", blogSchema);
