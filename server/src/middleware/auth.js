import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errors.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) throw new AppError('Authentication required.', 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { throw new AppError('Session expired. Please sign in again.', 401); }
  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw new AppError('Account is unavailable.', 401);
  req.user = user;
  next();
});

export function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : next(new AppError('You do not have permission to perform this action.', 403));
}
