import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import College from '../models/College.js';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Register new user
 * First user automatically becomes admin if no admin exists
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeId, alias } = req.body;

    // Validate required fields
    if (!name || !email || !password || !collegeId) {
      return res.status(400).json({ message: 'Name, email, password, and collegeId are required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college || !college.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive college' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // First-user auto admin logic: Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    // Determine final role
    let finalRole = role;
    if (!adminExists) {
      // No admin exists - first user becomes admin automatically
      finalRole = 'admin';
    } else if (role && !['student', 'counselor'].includes(role)) {
      // If admin exists, validate role
      return res.status(400).json({ message: 'Invalid role. Must be student or counselor' });
    } else if (!role) {
      // If no role provided and admin exists, default to student
      finalRole = 'student';
    }

    // Create user with atomic operation
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      collegeId,
      alias: alias || name.split(' ')[0] // Default alias to first name
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: finalRole === 'admin' 
        ? 'User registered successfully as admin (first user)' 
        : 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        alias: user.alias,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('collegeId', 'name code');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        alias: user.alias,
        college: user.collegeId,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('collegeId', 'name code');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
