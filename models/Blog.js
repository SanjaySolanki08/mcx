const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Stores full HTML content
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, required: true }, // Required main blog image
  createdAt: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
  updatedAt: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
  isPublished: { type: Boolean, default: true },
});

module.exports = mongoose.model("Blog", blogSchema);
