const axios = require('axios');

const getMCXData = async (req, res) => {
  try {
    // Placeholder for a paid Indian MCX API (e.g., Global Datafeeds)
    const response = await axios.get('https://api.globaldatafeeds.in/mcx/realtime', {
      headers: { 'Authorization': `Bearer ${process.env.MCX_API_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianMarketData = async (req, res) => {
  try {
    // Placeholder for NSE/BSE data (e.g., Nifty, Sensex, Bank Nifty, VIX)
    const response = await axios.get('https://api.globaldatafeeds.in/nse/realtime', {
      headers: { 'Authorization': `Bearer ${process.env.INDIAN_API_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianNews = async (req, res) => {
  try {
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
    const response = await axios.get(
      `https://finnhub.io/api/v1/ipo/calendar?from=${new Date().toISOString().split('T')[0]}&to=2025-12-31&token=${process.env.FINNHUB_API_KEY}`
    );
    // Note: Finnhub is global; filter Indian IPOs manually or use an Indian-specific API
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
    const response = await axios.get('https://api.globaldatafeeds.in/nse/gainers', {
      headers: { 'Authorization': `Bearer ${process.env.INDIAN_API_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIndianLosers = async (req, res) => {
  try {
    const response = await axios.get('https://api.globaldatafeeds.in/nse/losers', {
      headers: { 'Authorization': `Bearer ${process.env.INDIAN_API_KEY}` }
    });
    res.json(response.data);
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
};