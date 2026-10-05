import { Router } from 'express';
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router(); router.use(authenticate);
router.get('/', asyncHandler(async (req, res) => {
  const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const end = new Date(start); end.setDate(end.getDate() + 1);
  const scope = req.user.role === 'employee' ? { employee: req.user._id } : {};
  const [pending, today, inside, scheduled, employees, recent] = await Promise.all([
    Visitor.countDocuments({ ...scope, status: 'pending' }),
    Visitor.countDocuments({ ...scope, visitDate: { $gte: start, $lt: end }, status: { $ne: 'cancelled' } }),
    Visitor.countDocuments({ ...scope, status: 'checked-in' }),
    Visitor.countDocuments({ ...scope, status: 'approved', visitDate: { $gte: start, $lt: end } }),
    req.user.role === 'administrator' ? User.countDocuments({ role: 'employee', active: true }) : Promise.resolve(null),
    Visitor.find({ ...scope, status: { $ne: 'cancelled' } }).populate([{ path: 'employee', select: 'name department' }, { path: 'createdBy', select: 'name' }]).sort({ createdAt: -1 }).limit(6)
  ]);
  res.json({ stats: { pending, today, inside, scheduled, employees }, recent });
}));
export default router;
