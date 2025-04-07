const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, // Removes whitespace from both ends
    minlength: 3, // Minimum length for username
    maxlength: 30 // Maximum length for username
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String 
  }, // Hashed for email login
  googleId: { 
    type: String 
  }, // For Google login
  profilePhoto: { 
    type: String, 
    default: null // Optional field, can be null initially
  }, // URL or file path to the profile photo
  lastPostDate: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
  accountStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'deleted'], 
    default: 'active' 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String 
  }, // For reactivation
  otpExpires: { 
    type: Date 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  }, // Admin flag
  createdAt: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
  lastActive: { 
    type: Date, 
    default: () => {
      const date = new Date();
      const offset = 5.5 * 60; // 5 hours 30 minutes in minutes
      const newDate = new Date(date.getTime() + offset * 60 * 1000); // Adjust date in milliseconds
      return newDate;
    }
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
