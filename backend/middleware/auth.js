import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

/**
 * Middleware to ensure user can only access their own college's data
 * Enforces strict multi-tenant isolation
 */
export const enforceCollegeAccess = (req, res, next) => {
  if (!req.user || !req.user.collegeId) {
    return res.status(403).json({ message: 'Access denied: College information missing' });
  }

  // If collegeId is provided in params/body/query, verify it matches user's college
  const requestedCollegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;
  
  if (requestedCollegeId && requestedCollegeId.toString() !== req.user.collegeId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied: Cannot access other college data',
      requested: requestedCollegeId,
      userCollege: req.user.collegeId
    });
  }

  // Automatically attach collegeId filter to request for all queries
  // Controllers should use req.user.collegeId or req.collegeId for filtering
  req.collegeId = req.user.collegeId;
  
  // Override any attempt to set collegeId in body/params to user's college
  if (req.body.collegeId) {
    req.body.collegeId = req.user.collegeId;
  }
  if (req.params.collegeId) {
    req.params.collegeId = req.user.collegeId;
  }
  
  next();
};
