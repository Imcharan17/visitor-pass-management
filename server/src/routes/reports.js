import { Router } from 'express';
import Visitor from '../models/Visitor.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router(); router.use(authenticate, allowRoles('administrator'));
router.get('/', asyncHandler(async (req, res) => {
  const now = new Date(); let from, to;
  if (req.query.period === 'week') {
    from = new Date(now); const day = (from.getDay() + 6) % 7; from.setDate(from.getDate() - day); from.setHours(0, 0, 0, 0);
    to = new Date(from); to.setDate(to.getDate() + 7);
  } else if (req.query.period === 'custom' && req.query.from && req.query.to) {
    from = new Date(`${req.query.from}T00:00:00`); to = new Date(`${req.query.to}T23:59:59.999`);
  } else { from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); to = new Date(from); to.setDate(to.getDate() + 1); }
  const filter = { visitDate: { $gte: from, $lt: to }, status: { $ne: 'cancelled' } };
  const [total, byStatus, byDay, visitors] = await Promise.all([
    Visitor.countDocuments(filter),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Visitor.aggregate([{ $match: filter }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Visitor.find(filter).populate([{ path: 'employee', select: 'name department' }, { path: 'createdBy', select: 'name' }]).sort({ visitDate: -1 }).limit(500)
  ]);
  res.json({ summary: { total, byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])), byDay }, visitors });
}));
export default router;
