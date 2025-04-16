const express = require('express');
const router = express.Router();
const {
  getMCXData,
  getIndianMarketData,
  getIndianNews,
  getIndianIPOUpcoming,
  getIndianIPONews,
  getIndianGainers,
  getIndianLosers,
  getMarketData,
} = require('../controllers/marketController');
const updateLastActive = require('../middleware/updateLastActive');
const { getBlogs, getBlogById } = require('../controllers/adminController');

const smartAPIService = require('../services/smartAPI');

router.get('/market-data', 
  smartAPIService.checkSession(),
  getMarketData
);
router.get('/mcx', getMCXData);
router.get('/indian', getIndianMarketData);
router.get('/news', getIndianNews);
router.get('/ipo/upcoming', getIndianIPOUpcoming);
router.get('/ipo/news', getIndianIPONews);
router.get('/gainers', getIndianGainers);
router.get('/losers', getIndianLosers);
router.get("/blogs",  getBlogs);
router.get('/blogs/:id', getBlogById);
router.get('/api/market-data', (req, res) => {
  const mockData = {
    Sensex: [Date.now(), 80000, 80500, 79500, 80250, 1000000],
    Nifty: [Date.now(), 24000, 24200, 23800, 24150, 1200000],
    VIX: [Date.now(), 15, 16, 14, 15.5, 500000],
    Gold: [Date.now(), 70000, 70500, 69500, 70200, 80000],
  };
  res.json({ success: true, data: mockData });
});



module.exports = router;