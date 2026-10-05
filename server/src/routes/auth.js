import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required.');
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !user.active || !(await user.comparePassword(password))) throw new AppError('Email or password is incorrect.', 401);
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: user.toJSON() });
}));
router.get('/me', authenticate, (req, res) => res.json({ user: req.user.toJSON() }));
export default router;
