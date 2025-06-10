import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = await User.create({ name, email, password, role });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Optionally set refreshToken in cookie (secure for prod)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Optionally set refreshToken in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



/**
 * @desc    Refresh access token using refresh token
 * @route   GET /api/auth/refresh
 * @access  Public
 */
export const refreshToken = async (req, res) => {
    try {
      const token = req.cookies.refreshToken;
      if (!token) return res.status(401).json({ message: 'No refresh token' });
  
      // Verify refresh token
      import('jsonwebtoken').then(({ default: jwt }) => {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
          if (err) return res.status(403).json({ message: 'Invalid refresh token' });
  
          const user = { id: decoded.id }; // Optionally fetch user from DB if needed
          const accessToken = generateAccessToken(user);
  
          res.status(200).json({ accessToken });
        });
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  /**
   * @desc    Logout user
   * @route   POST /api/auth/logout
   * @access  Public
   */
  export const logout = (req, res) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  
    res.status(200).json({ message: 'Logged out successfully' });
  };
  