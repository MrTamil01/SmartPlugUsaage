const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('username').isString().trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('name').isString().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name } = req.body;

    try {
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user = new User({
        username,
        password,
        name,
        role: 'user',
        devices: [],
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty(),
    body('password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role, mustChangePassword: user.mustChangePassword } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// POST /api/auth/create-user (for admin to create users)
router.post(
  '/create-user',
  auth,
  [
    body('username').isString().trim().notEmpty(),
    body('name').isString().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { username, name } = req.body;

    try {
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user = new User({
        username,
        password: '12345678', // default password
        name,
        role: 'user',
        mustChangePassword: true,
        devices: [],
      });

      await user.save();

      res.status(201).json({ message: 'User created successfully', user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// PATCH /api/auth/change-password
router.patch(
  '/change-password',
  auth,
  [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      user.mustChangePassword = false;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
