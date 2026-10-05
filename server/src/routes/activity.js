import { Router } from 'express';
import Activity from '../models/Activity.js';
import Visitor from '../models/Visitor.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router(); router.use(authenticate, allowRoles('administrator'));
router.get('/', asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.action) query.action = req.query.action;
  if (req.query.from || req.query.to) {
    query.createdAt = {};
    if (req.query.from) query.createdAt.$gte = new Date(`${req.query.from}T00:00:00`);
    if (req.query.to) query.createdAt.$lte = new Date(`${req.query.to}T23:59:59.999`);
  }
  if (req.query.search) {
    const visitors = await Visitor.find({ name: new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).select('_id');
    query.visitor = { $in: visitors.map(v => v._id) };
  }
  const activities = await Activity.find(query).populate([{ path: 'visitor', select: 'name phone status' }, { path: 'performedBy', select: 'name role' }]).sort({ createdAt: -1 }).limit(500);
  res.json({ activities });
}));
export default router;
