// const express = require('express');
// const cors = require('cors');
// const fs = require('fs').promises;
// const path = require('path');
// const updateLastActive = require('./middleware/updateLastActive');
// const connectDB = require('./config/db');
// require('dotenv').config();

// // Import routes
// const authRoutes = require('./routes/auth');
// const marketRoutes = require('./routes/market');
// const tipsRoutes = require('./routes/tips');
// const adminRoutes = require('./routes/admin');

// const app = express();
// const port = process.env.PORT || 5000;

// // Configure CORS
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// // Middleware
// app.use(express.json());
// app.use(express.static('public'));
// app.use(updateLastActive);

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/market', marketRoutes);
// app.use('/api/tips', tipsRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/uploads', express.static('uploads'));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(500).json({
//     error: 'Internal server error',
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
//   });
// });

// // Start server only after connecting to DB
// (async () => {
//   try {
//     await connectDB(); // 👈 Connect to MongoDB first

//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//     });
//   } catch (err) {
//     console.error('Failed to start server:', err);
//     process.exit(1);
//   }
// })();

// // Process handlers
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
// });

// process.on('unhandledRejection', (error) => {
//   console.error('Unhandled Rejection:', error);
// });




// // new working code 

// const express = require('express');
// const { SmartAPI } = require('smartapi-javascript');
// const fs = require('fs');
// const path = require('path');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// app.use(express.json());
// app.use(express.static('public'));

// const SESSION_FILE_PATH = path.join(__dirname, 'session.json');

// // Initialize SmartAPI
// let smart_api;
// try {
//   smart_api = new SmartAPI({
//     api_key: process.env.SMART_API_KEY,
//     debug: true
//   });
//   console.log('SmartAPI initialized successfully');
// } catch (error) {
//   console.error('Error initializing SmartAPI:', error);
//   process.exit(1);
// }

// let session = null;

// // Session Management Functions
// function isSessionExpired(sessionData) {
//   if (!sessionData || !sessionData.loginTime) return true;
//   const loginTime = new Date(sessionData.loginTime).getTime();
//   const currentTime = new Date().getTime();
//   const oneDay = 24 * 60 * 60 * 1000; 
//   return currentTime - loginTime > oneDay;
// }

// function saveSession(sessionData) {
//   try {
//     fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData, null, 2));
//     console.log('Session saved to file');
//   } catch (error) {
//     console.error('Error saving session:', error);
//   }
// }

// async function loadSession() {
//   try {
//     if (fs.existsSync(SESSION_FILE_PATH)) {
//       const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf8'));
//       if (sessionData && !isSessionExpired(sessionData)) {
//         session = sessionData;
//         smart_api.jwtToken = session.jwtToken;
//         console.log('Session loaded from file');
//         return true;
//       }
//     }
//   } catch (error) {
//     console.error('Error loading session:', error);
//   }
//   return false;
// }

// async function regenerateSession() {
//   try {
//     console.log('Attempting to generate session...');
//     const client_code = process.env.CLIENT_ID;
//     const password = process.env.PASSWORD;
//     const totp = process.env.TOTP;

//     if (!client_code || !password || !totp) {
//       throw new Error('Missing required environment variables for login');
//     }

//     const data = await smart_api.generateSession(client_code, password, totp);
//     if (!data || data.status === false) {
//       throw new Error(data?.message || 'Session generation failed');
//     }

//     session = {
//       ...(data.data || data),
//       clientId: client_code,
//       loginTime: new Date().toISOString()
//     };

//     smart_api.jwtToken = session.jwtToken;
//     saveSession(session);
//     console.log('New session generated successfully');
//     return true;
//   } catch (error) {
//     console.error('Failed to regenerate session:', error);
//     throw error;
//   }
// }

// // Middleware to check session
// const checkSession = async (req, res, next) => {
//   if (session && !isSessionExpired(session)) {
//     return next();
//   }

//   console.log('Session missing/expired, regenerating...');
//   try {
//     await regenerateSession();
//     next();
//   } catch (error) {
//     res.status(401).json({ 
//       success: false, 
//       message: 'Session renewal failed',
//       error: error.message 
//     });
//   }
// };

// // Routes
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     session: !!session
//   });
// });

// app.post('/api/login', async (req, res) => {
//   try {
//     await regenerateSession();
//     res.json({
//       success: true,
//       message: 'Login successful',
//       session: {
//         clientId: session.clientId,
//         loginTime: session.loginTime
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Login failed'
//     });
//   }
// });

// // Market Data Endpoint (similar to your working version)
// app.get('/api/market-data', checkSession, async (req, res) => {
//   try {
//     console.log('Fetching market data...');
    
//     // Get current market data (similar to your working version)
//     const marketData = {
//       Sensex: [Date.now(), 80000, 80500, 79500, 80250, 1000000],
//       Nifty: [Date.now(), 24000, 24200, 23800, 24150, 1200000],
//       VIX: [Date.now(), 15, 16, 14, 15.5, 500000],
//       Gold: [Date.now(), 70000, 70500, 69500, 70200, 80000],
//     };
    
//     res.json({ 
//       success: true, 
//       data: marketData 
//     });
//   } catch (error) {
//     console.error('Market data error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch market data',
//       error: error.message 
//     });
//   }
// });

// // Server Startup
// (async () => {
//   try {
//     // Load existing session or create new one
//     if (!await loadSession()) {
//       await regenerateSession();
//     }
    
//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//       console.log(`Session status: ${session ? 'Active' : 'Inactive'}`);
//     });
//   } catch (error) {
//     console.error('Server startup failed:', error);
//     process.exit(1);
//   }
// })();

// // Error handlers
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
// });
// process.on('unhandledRejection', (error) => {
//   console.error('Unhandled Rejection:', error);
// });