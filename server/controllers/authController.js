const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { memoryStore, isMongoConnected } = require('../dataStore');
const { JWT_SECRET } = require('../middleware/auth');
const User = require('../models/User');

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'Missing credentials'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try MongoDB if connected
    if (isMongoConnected()) {
      try {
        const user = await User.findOne({
          $or: [
            { email: cleanEmail },
            { email: cleanEmail.replace('@issuehub.edu', '@resolvex.edu') },
            { email: cleanEmail.replace('@resolvex.edu', '@issuehub.edu') }
          ]
        });

        if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            const token = generateToken(user);
            const userResponse = {
              _id: user._id.toString(),
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              studentId: user.studentId,
              department: user.department,
              phone: user.phone
            };
            return res.status(200).json({
              success: true,
              token,
              user: userResponse
            });
          }
        }
      } catch (dbErr) {
        console.warn('[Auth Controller] MongoDB query failed, falling back to memory store:', dbErr.message);
      }
    }

    // 2. Memory Store fallback
    const memUser = memoryStore.findUserByEmail(cleanEmail);
    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    const isMatch = bcrypt.compareSync(password, memUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Authentication failed'
      });
    }

    const token = generateToken(memUser);
    const userResponse = {
      _id: memUser._id,
      id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      role: memUser.role,
      studentId: memUser.studentId,
      department: memUser.department,
      phone: memUser.phone
    };

    return res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: err.message
    });
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password, role = 'student', studentId, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        error: 'Validation error'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    if (isMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
          error: 'Email already registered'
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        studentId,
        department,
        phone
      });
      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: newUser._id.toString(),
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          studentId: newUser.studentId,
          department: newUser.department
        }
      });
    }

    // Memory Store register
    const existing = memoryStore.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        error: 'Email already registered'
      });
    }

    const newUser = memoryStore.createUser({
      name,
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      studentId,
      department,
      phone
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        department: newUser.department
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to register account',
      error: err.message
    });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
}

module.exports = {
  login,
  register,
  getMe,
  logout
};
