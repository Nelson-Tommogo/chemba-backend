import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';

// ========================
//  Utility Functions
// ========================
const getToken = (req) => 
  req.header('x-auth-token') || 
  req.cookies?.token || 
  req.query?.token;

const authError = (res, message = 'Authentication failed') => 
  res.status(401).json({ 
    error: message,
    solution: 'Please login or provide valid credentials'
  });

// ========================
//  Rate Limiter (NEW)
// ========================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts/window
  message: {
    error: 'Too many login attempts',
    solution: 'Wait 15 minutes or contact support'
  },
  skip: process.env.NODE_ENV === 'development' // Disable in dev
});

// ========================
//  Async Error Handler (NEW)
// ========================
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ========================
//  Authentication Middleware
// ========================
export const authenticate = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return authError(res, 'No authentication token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.user?.id) return authError(res, 'Malformed token payload');

    const user = await User.findById(decoded.user.id)
      .select('-password -refreshToken -__v')
      .lean();
    
    if (!user) return authError(res, 'User no longer exists');
    if (user.status !== 'active') return authError(res, 'Account suspended');

    req.user = {
      ...user,
      tokenVersion: decoded.user.tokenVersion
    };

    next();
  } catch (err) {
    console.error(`Auth Error: ${err.message}`);

    if (err.name === 'TokenExpiredError') {
      return authError(res, 'Session expired. Please login again');
    }
    if (err.name === 'JsonWebTokenError') {
      return authError(res, 'Invalid token detected');
    }

    authError(res, 'Authentication processing failed');
  }
};

// ========================
//  Role Authorization
// ========================
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return authError(res);

    const hasRole = allowedRoles.some(role => 
      Array.isArray(role) 
        ? role.includes(req.user.role)
        : role === req.user.role
    );

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        requiredRoles: allowedRoles.flat(),
        yourRole: req.user.role
      });
    }

    next();
  };
};

// ========================
//  Token Freshness Check
// ========================
export const checkTokenFreshness = (maxAgeMinutes = 15) => {
  return (req, res, next) => {
    if (req.user?.iat) {
      const tokenAge = (Date.now() - req.user.iat * 1000) / (1000 * 60);
      if (tokenAge > maxAgeMinutes) {
        return res.status(401).json({
          error: 'Stale token',
          solution: 'Re-authenticate for this sensitive operation'
        });
      }
    }
    next();
  };
};

// Optional: Export all as object
export default {
  authLimiter,
  catchAsync,
  authenticate,
  authorize,
  checkTokenFreshness
};