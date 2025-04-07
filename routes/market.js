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
} = require('../controllers/marketController');
const updateLastActive = require('../middleware/updateLastActive');


router.get('/mcx', getMCXData);
router.get('/indian', getIndianMarketData);
router.get('/news', getIndianNews);
router.get('/ipo/upcoming', getIndianIPOUpcoming);
router.get('/ipo/news', getIndianIPONews);
router.get('/gainers', getIndianGainers);
router.get('/losers', getIndianLosers);

module.exports = router;