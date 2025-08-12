import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Token sources (header, cookie, query param)
const getToken = (req) => 
  req.header('x-auth-token') || 
  req.cookies?.token || 
  req.query?.token;

// Unified error response
const authError = (res, message = 'Authentication failed') => 
  res.status(401).json({ 
    error: message,
    solution: 'Please login or provide valid credentials'
  });

// Main authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from multiple sources
    const token = getToken(req);
    if (!token) return authError(res, 'No authentication token provided');

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.user?.id) return authError(res, 'Malformed token payload');

    // 3. Fetch fresh user data (prevent stale permissions)
    const user = await User.findById(decoded.user.id)
      .select('-password -refreshToken -__v')
      .lean();
    
    if (!user) return authError(res, 'User no longer exists');
    if (user.status !== 'active') return authError(res, 'Account suspended');

    // 4. Attach user to request
    req.user = {
      ...user,
      tokenVersion: decoded.user.tokenVersion // For token invalidation
    };

    // 5. Proceed
    next();
  } catch (err) {
    console.error(`Auth Error: ${err.message}`);

    // Specific error messages
    if (err.name === 'TokenExpiredError') {
      return authError(res, 'Session expired. Please login again');
    }
    if (err.name === 'JsonWebTokenError') {
      return authError(res, 'Invalid token detected');
    }

    authError(res, 'Authentication processing failed');
  }
};

// Role authorization middleware (flexible version)
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user exists (should be attached by authenticate)
    if (!req.user) return authError(res);

    // 2. Check role permissions
    const hasRole = allowedRoles.some(role => 
      Array.isArray(role) 
        ? role.includes(req.user.role) // Multiple allowed roles
        : role === req.user.role       // Single role
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

// Token refresh checker (for critical operations)
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