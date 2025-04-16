'use strict';

module.exports = {
  API: {
    root: 'https://apiconnect.angelbroking.com', // Replace with actual API base URL
    login: '/rest/auth/angelbroking/user/v1/loginByPassword', // Example for Angel Broking
    user_login: '/rest/auth/angelbroking/user/v1/loginByPassword', // Session generation endpoint
    market_data: '/rest/secure/angelbroking/market/v1/marketData', // Market data endpoint
    timeout: 10000, // 10 seconds
    debug: true, // Enable debug logging
  },
};