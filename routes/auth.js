const express = require('express');
const router = express.Router();
const { register, login, reactivateAccount, getUserById } = require('../controllers/authController');
const upload = require('../middleware/upload'); // Your multer middleware
const jwt = require('jsonwebtoken');
const fs = require('fs'); // To delete old profile photo
const path = require('path');
const updateLastActive = require('../middleware/updateLastActive');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ msg: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    res.status(403).json({ msg: 'Invalid token' });
  }
};

const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.post('/reactivate', reactivateAccount);
router.get('/user/:id', getUserById);

// 🔹 Upload or Update Profile Photo
router.post(
  '/upload-profile-photo',
  authenticateToken,
  upload.single('profilePhoto'),
  async (req, res) => {
    try {
      console.log('Request received:', req.body);
      console.log('Uploaded file:', req.file);

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ error: 'User ID is missing from token' });
      }

      const filePath = `/uploads/${req.file.filename}`;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 🔹 Delete old profile photo if it exists
      if (user.profilePhoto && user.profilePhoto !== '/uploads/default.png') {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        fs.unlink(oldPhotoPath, (err) => {
          if (err) console.error('Failed to delete old profile photo:', err);
          else console.log('Old profile photo deleted:', oldPhotoPath);
        });
      }

      // Update the new profile photo
      user.profilePhoto = filePath;
      await user.save();

      return res.status(200).json({
        message: 'Profile photo updated successfully',
        profilePhoto: filePath,
      });
    } catch (error) {
      console.error('Profile upload error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
