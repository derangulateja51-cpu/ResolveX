const jwt = require('jsonwebtoken');
const { memoryStore, isMongoConnected } = require('../dataStore');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'issuehub_jwt_secret_key_2026_production';

/**
 * Verify JWT Bearer token
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
      error: 'Unauthorized'
    });
  }

  // Handle mock tokens for testing/development if needed
  if (token.startsWith('mock_jwt_token_')) {
    const parts = token.split('_');
    const role = parts[3] || 'student';
    const email = role === 'admin' 
      ? 'admin@issuehub.edu' 
      : role === 'grievance_officer' 
        ? 'grievance@issuehub.edu' 
        : 'student@issuehub.edu';
    
    const user = memoryStore.findUserByEmail(email);
    if (user) {
      req.user = {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      };
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoConnected()) {
      const dbUser = await User.findById(decoded.id || decoded._id).select('-password');
      if (dbUser) {
        req.user = {
          _id: dbUser._id.toString(),
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          studentId: dbUser.studentId,
          department: dbUser.department
        };
        return next();
      }
    }

    // Check memory store
    const memUser = memoryStore.findUserById(decoded.id || decoded._id) || 
                    memoryStore.findUserByEmail(decoded.email);

    if (memUser) {
      req.user = {
        _id: memUser._id,
        id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        studentId: memUser.studentId,
        department: memUser.department
      };
      return next();
    }

    // If decoded payload has essential fields, use them
    if (decoded.role && (decoded.id || decoded._id)) {
      req.user = decoded;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired user session.',
      error: 'Unauthorized'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed.',
      error: err.message
    });
  }
}

/**
 * Role-Based Access Control Middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before accessing this endpoint.',
        error: 'Unauthorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        error: 'Forbidden'
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
