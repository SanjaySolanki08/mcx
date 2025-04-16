// services/smartAPI.js - Corrected Version
const { SmartAPI } = require('smartapi-javascript');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const SESSION_FILE_PATH = path.join(__dirname, '../session.json');

class SmartAPIService {
  constructor() {
    this.session = null;
    this.smart_api = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.smart_api = new SmartAPI({
        api_key: process.env.SMART_API_KEY,
        debug: true // Enable debug mode for more detailed logs
      });
      
      await this.loadSession();
      console.log('SmartAPI initialized');
      this.initialized = true;
    } catch (error) {
      console.error('SmartAPI init error:', error);
      throw error;
    }
  }

  async loadSession() {
    try {
      const data = await fs.readFile(SESSION_FILE_PATH, 'utf8');
      const sessionData = JSON.parse(data);
  
      if (sessionData && !this.isSessionExpired(sessionData)) {
        this.session = sessionData;
        this.smart_api.jwtToken = sessionData.jwtToken; // ✅ Correct assignment
        console.log('Session loaded successfully');
      } else {
        console.log('Session expired or invalid, will regenerate');
        await this.regenerateSession();
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No session file found, will create new session');
        await this.regenerateSession();
      } else {
        console.error('Session load error:', error);
        throw error;
      }
    }
  }
  

  isSessionExpired(sessionData) {
    if (!sessionData?.jwtToken || !sessionData?.loginTime) return true;
    
    const tokenExpiry = new Date(sessionData.loginTime).getTime() + (24 * 60 * 60 * 1000);
    return Date.now() > tokenExpiry;
  }

  async saveSession(sessionData) {
    try {
      await fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionData, null, 2));
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  async regenerateSession() {
    try {
      console.log('Starting session regeneration...');
      
      if (!process.env.CLIENT_ID || !process.env.PASSWORD || !process.env.TOTP) {
        throw new Error('Missing required credentials in environment variables');
      }

      const data = await this.smart_api.generateSession(
        process.env.CLIENT_ID,
        process.env.PASSWORD,
        process.env.TOTP
      );

      console.log('Session generation response:', JSON.stringify(data, null, 2));

      if (!data || data.status === false) {
        throw new Error(data?.message || 'Session generation failed');
      }

      this.session = {
        ...(data.data || data),
        clientId: process.env.CLIENT_ID,
        loginTime: new Date().toISOString()
      };

      this.smart_api.setToken(this.session.jwtToken); // Direct assignment here too
      await this.saveSession(this.session);
      
      console.log('Session regenerated successfully');
      return this.session;
    } catch (error) {
      console.error('Session regeneration failed:', error);
      throw error;
    }
  }

  checkSession() {
    return async (req, res, next) => {
      try {
        if (!this.session || this.isSessionExpired(this.session)) {
          console.log('Session invalid/expired, regenerating...');
          await this.regenerateSession();
        }
        next();
      } catch (error) {
        console.error('Session check failed:', error);
        return res.status(401).json({ 
          success: false,
          error: 'Session renewal failed',
          details: error.message
        });
      }
    };
  }

  // Add a method to explicitly get the current token
  getCurrentToken() {
    return this.session?.jwtToken;
  }
}

module.exports = new SmartAPIService();