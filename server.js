const express = require('express');
const { SmartAPI } = require('smartapi-javascript');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
 const marketRoutes = require('./routes/market');
 const tipsRoutes = require('./routes/tips');
 const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 5000;

// // Start server only after connecting to DB

     connectDB(); // 👈 Connect to MongoDB first

   

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

const SESSION_FILE_PATH = path.join(__dirname, 'session.json');

// Initialize SmartAPI
let smart_api;
try {
  smart_api = new SmartAPI({
    api_key: process.env.SMART_API_KEY,
    debug: true
  });
  console.log('SmartAPI initialized successfully');
} catch (error) {
  console.error('Error initializing SmartAPI:', error);
  process.exit(1);
}

let session = null;

// Session Management Functions
function isSessionExpired(sessionData) {
  if (!sessionData || !sessionData.loginTime) return true;
  const loginTime = new Date(sessionData.loginTime).getTime();
  const currentTime = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000; 
  return currentTime - loginTime > oneDay;
}

function saveSession(sessionData) {
  try {
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData, null, 2));
    console.log('Session saved to file');
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

async function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE_PATH)) {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf8'));
      if (sessionData && !isSessionExpired(sessionData)) {
        session = sessionData;
        smart_api.jwtToken = session.jwtToken;
        console.log('Session loaded from file');
        return true;
      }
    }
  } catch (error) {
    console.error('Error loading session:', error);
  }
  return false;
}

async function regenerateSession() {
  try {
    console.log('Attempting to generate session...');
    const client_code = process.env.CLIENT_ID;
    const password = process.env.PASSWORD;
    const totp = process.env.TOTP;

    if (!client_code || !password || !totp) {
      throw new Error('Missing required environment variables for login');
    }

    const data = await smart_api.generateSession(client_code, password, totp);
    if (!data || data.status === false) {
      throw new Error(data?.message || 'Session generation failed');
    }

    session = {
      ...(data.data || data),
      clientId: client_code,
      loginTime: new Date().toISOString()
    };

    smart_api.jwtToken = session.jwtToken;
    saveSession(session);
    console.log('New session generated successfully');
    return true;
  } catch (error) {
    console.error('Failed to regenerate session:', error);
    throw error;
  }
}

// Middleware to check session
const checkSession = async (req, res, next) => {
  if (session && !isSessionExpired(session)) {
    return next();
  }

  console.log('Session missing/expired, regenerating...');
  try {
    await regenerateSession();
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Session renewal failed',
      error: error.message 
    });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    session: !!session
  });
});

app.post('/api/login', async (req, res) => {
  try {
    await regenerateSession();
    res.json({
      success: true,
      message: 'Login successful',
      session: {
        clientId: session.clientId,
        loginTime: session.loginTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Market Data Endpoint (similar to your working version)
app.get('/api/market-data', checkSession, async (req, res) => {
  try {
    console.log('Fetching live market data from SmartAPI...');

    const instruments = [
      { name: "Nifty", exchange: "NSE", token: "3045", symbol: "NIFTY" },
      { name: "Sensex", exchange: "BSE", token: "999999", symbol: "SENSEX" },
      { name: "BankNifty", exchange: "NSE", token: "26009", symbol: "BANKNIFTY" },
      { name: "Gold", exchange: "MCX", token: "4463", symbol: "GOLDM" },
      { name: "VIX", exchange: "NSE", token: "26488", symbol: "INDIAVIX" }
    ];

    const marketData = {};

    for (const item of instruments) {
      try {
        const response = await smart_api.getQuote({
          exchange: item.exchange,
          tradingsymbol: item.symbol,
          symboltoken: item.token,
        });

        const quote = response.data?.[`${item.exchange}|${item.token}`];

        marketData[item.name] = {
          ltp: quote.ltp,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        console.error(`Error fetching ${item.name}:`, err.message);
        marketData[item.name] = { error: 'Fetch failed' };
      }
    }

    // 💡 Optional: Add placeholder for Dollar Index, Crypto, IPOs, etc.
    marketData.DollarIndex = {
      ltp: 104.3,
      change: "+0.14%",
      note: "Simulated data"
    };

    marketData.Bitcoin = {
      ltp: 66000,
      change: "-0.55%",
      note: "Simulated data"
    };

    res.json({ success: true, data: marketData });
  } catch (error) {
    console.error('Market data fetch error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch market data',
      error: error.message 
    });
  }
});


// Server Startup
(async () => {
  try {
    // Load existing session or create new one
    if (!await loadSession()) {
      await regenerateSession();
    }
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Session status: ${session ? 'Active' : 'Inactive'}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();

// // Routes
 app.use('/api/auth', authRoutes);
 app.use('/api/market', marketRoutes);
 app.use('/api/tips', tipsRoutes);
 app.use('/api/admin', adminRoutes);
 app.use('/uploads', express.static('uploads'));

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});