const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Remove "Bearer " part of the token

  // If token is not provided, return error
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to request object (req.user)
    req.user = decoded.id;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Token is not valid or has expired
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;