const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const tipsRoutes = require('./routes/tips');
const adminRoutes = require('./routes/admin');
const authMiddleware = require("./middleware/auth");
// const passport = require('passport');
const { checkInactiveAccounts } = require('./utils/accountManager');
const updateLastActive = require('./middleware/updateLastActive');
// ...

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
// app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// Routes
app.use(updateLastActive);
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));



// Basic route
app.get('/', (req, res) => {
  res.send('Stock Market Website API is running!');
});

// Schedule account management
checkInactiveAccounts();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});

