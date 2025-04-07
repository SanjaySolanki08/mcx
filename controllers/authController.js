const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Assuming you use multer for file uploads
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.body.userId;
    const file = req.file; // From multer

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }

    if (!file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const photoUrl = `/uploads/${file.filename}`;
    user.profilePhoto = photoUrl;
    await user.save();

    res.json({ profilePhoto: photoUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Existing functions (unchanged unless noted)
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Username, email, and password are required' });
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
      if (user.username === username) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      userId: user._id,
      username: user.username,
      profilePhoto: user.profilePhoto || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.accountStatus === 'deleted') {
      return res.status(400).json({ msg: 'This account is deleted by Admin' });
    }
    if (user.accountStatus === 'inactive') {
      return res.status(403).json({ msg: 'Account inactive, check email for OTP' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      userId: user._id,
      username: user.username, 
      profilePhoto: user.profilePhoto || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reactivateAccount = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.accountStatus = 'active';
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ msg: 'Account reactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { register, login, reactivateAccount, getUserById, uploadProfilePhoto };