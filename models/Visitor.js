const mongoose = require("mongoose");
const moment = require("moment-timezone");

const visitorSchema = new mongoose.Schema({
  ip: { type: String },
  city: { type: String }, 
  country: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  page: { type: String }, 
  visitedAt: { 
    type: Date, 
    default: () => moment().tz("Asia/Kolkata").toDate() // Stores IST time directly
  },
});

module.exports = mongoose.model("Visitor", visitorSchema);
