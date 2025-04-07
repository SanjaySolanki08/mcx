// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate categories
    trim: true,
  },
  
});

module.exports = mongoose.model("Category", categorySchema);