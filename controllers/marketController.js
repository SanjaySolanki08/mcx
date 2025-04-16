// controllers/marketController.js
const axios = require('axios');

const smartAPIService = require('../services/smartAPI');

const formatISTDate = (date) => {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
    .toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '');
};

const getMarketData = async (req, res) => {
  try {
    console.log('Current Token:', smartAPIService.getCurrentToken());
    
    const now = new Date();
    const data = await smartAPIService.smart_api.getCandleData({
      exchange: "NSE",
      symboltoken: "2885",
      interval: "ONE_MINUTE",
      fromdate: "2002-07-19 09:00",
      todate: formatISTDate(now)
    });
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
};

// Keep other existing controller functions...

const getMCXData = async (req, res) => {
//   try {
//     const params = {
//       mode: 'FULL',
//       exchangeTokens: {
//         MCX: ['your_mcx_token'], // Replace with actual MCX token
//       },
//     };
//     const data = await smartApiInstance.marketData(params);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
};

const getIndianMarketData = async (req, res) => {
//   try {
//     const params = {
//       mode: 'FULL',
//       exchangeTokens: {
//         NSE: ['99926000'], // NIFTY 50 token (example)
//       },
//     };
//     const data = await smartApiInstance.marketData(params);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
};

const getIndianNews = async (req, res) => {
  try {
    // SmartApi doesn’t provide news; use NewsAPI
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=business&country=in&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianIPOUpcoming = async (req, res) => {
  try {
    // SmartApi doesn’t provide IPO data; use Finnhub
    const response = await axios.get(
      `https://finnhub.io/api/v1/ipo/calendar?from=${new Date().toISOString().split('T')[0]}&to=2025-12-31&token=${process.env.FINNHUB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianIPONews = async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=IPO+India&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianGainers = async (req, res) => {
  try {
    // SmartApi has gainersLosers method
    const params = {
      exchange: 'NSE',
    };
    const data = await smartApiInstance.gainersLosers(params);
    // Filter gainers from response if needed
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianLosers = async (req, res) => {
  try {
    const params = {
      exchange: 'NSE',
    };
    const data = await smartApiInstance.gainersLosers(params);
    // Filter losers from response if needed
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMCXData,
  getIndianMarketData,
  getIndianNews,
  getIndianIPOUpcoming,
  getIndianIPONews,
  getIndianGainers,
  getIndianLosers,
  getMarketData,
};