import { Router } from 'express';
import Visitor from '../models/Visitor.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);
const populate = [{ path: 'employee', select: 'name email department' }, { path: 'createdBy', select: 'name role' }];
function scopedFilter(user) {
  if (user.role === 'employee') return { employee: user._id };
  return {};
}
function dateBounds(query) {
  const filter = {};
  if (query.from || query.to) {
    filter.visitDate = {};
    if (query.from) filter.visitDate.$gte = new Date(`${query.from}T00:00:00.000Z`);
    if (query.to) filter.visitDate.$lte = new Date(`${query.to}T23:59:59.999Z`);
  }
  return filter;
}
async function record(visitor, action, user, details = '') { await Activity.create({ visitor: visitor._id, action, performedBy: user._id, details }); }

router.get('/', asyncHandler(async (req, res) => {
  const filter = { ...scopedFilter(req.user), ...dateBounds(req.query), status: req.query.status || { $ne: 'cancelled' } };
  if (req.query.employee && req.user.role !== 'employee') filter.employee = req.query.employee;
  if (req.query.search) {
    const pattern = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const employeeMatches = await User.find({ role: 'employee', $or: [{ name: pattern }, { department: pattern }] }).select('_id');
    filter.$or = [{ name: pattern }, { phone: pattern }, { company: pattern }, { purpose: pattern }, { employee: { $in: employeeMatches.map(employee => employee._id) } }];
  }
  const visitors = await Visitor.find(filter).populate(populate).sort({ visitDate: -1, arrivalTime: -1 }).limit(500);
  res.json({ visitors });
}));
router.post('/', allowRoles('receptionist', 'administrator'), requireFields('name', 'phone', 'employee', 'visitDate', 'arrivalTime', 'purpose'), asyncHandler(async (req, res) => {
  const { name, email, phone, company, idType, idNumber, employee, visitDate, arrivalTime, purpose } = req.body;
  const date = new Date(visitDate);
  if (Number.isNaN(date.getTime())) throw new AppError('Enter a valid visit date.');
  const today = new Date(); const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const visitDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (visitDay < todayStart) throw new AppError('Visit date cannot be earlier than today.');
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(arrivalTime)) throw new AppError('Enter a valid arrival time.');
  if (visitDay.getTime() === todayStart.getTime()) {
    const [hours, minutes] = arrivalTime.split(':').map(Number);
    const arrival = new Date(todayStart); arrival.setHours(hours, minutes, 0, 0);
    if (arrival < today) throw new AppError('Arrival time must be later than the current time.');
  }
  const employeeUser = await User.findOne({ _id: employee, role: 'employee', active: true });
  if (!employeeUser) throw new AppError('Select an active employee.');
  const sameDay = new Date(date); sameDay.setHours(0, 0, 0, 0); const end = new Date(sameDay); end.setDate(end.getDate() + 1);
  const existing = await Visitor.findOne({ phone: phone.trim(), visitDate: { $gte: sameDay, $lt: end }, status: { $ne: 'cancelled' } });
  if (existing) throw new AppError('A visit for this visitor is already registered on that date.', 409);
  const activeVisit = await Visitor.findOne({ phone: phone.trim(), status: 'checked-in' });
  if (activeVisit) throw new AppError('This visitor already has an active visit.', 409);
  const pendingCount = await Visitor.countDocuments({ employee, status: 'pending' });
  if (pendingCount >= 3) throw new AppError('This employee already has three pending requests.');
  const visitor = await Visitor.create({ name, email, phone, company, idType, idNumber, employee, visitDate: date, arrivalTime, purpose, createdBy: req.user._id });
  await record(visitor, 'created', req.user);
  await visitor.populate(populate);
  res.status(201).json({ visitor });
}));
router.patch('/:id/decision', allowRoles('employee'), requireFields('decision'), asyncHandler(async (req, res) => {
  const { decision, remarks = '' } = req.body;
  if (!['approved', 'rejected'].includes(decision)) throw new AppError('Decision must be approve or reject.');
  const visitor = await Visitor.findOne({ _id: req.params.id, employee: req.user._id });
  if (!visitor) throw new AppError('Visitor request not found.', 404);
  if (visitor.status !== 'pending') throw new AppError('Only pending requests can be reviewed.');
  visitor.status = decision; visitor.remarks = remarks.trim(); if (decision === 'approved') visitor.approvedAt = new Date();
  await visitor.save(); await record(visitor, decision, req.user, remarks); await visitor.populate(populate);
  res.json({ visitor });
}));
router.patch('/:id/remarks', allowRoles('employee'), requireFields('remarks'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOne({ _id: req.params.id, employee: req.user._id });
  if (!visitor) throw new AppError('Visitor request not found.', 404);
  visitor.remarks = req.body.remarks.trim(); await visitor.save(); await record(visitor, 'remarked', req.user, visitor.remarks);
  res.json({ visitor });
}));
router.patch('/:id/check-in', allowRoles('receptionist', 'administrator'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id); if (!visitor) throw new AppError('Visitor not found.', 404);
  if (visitor.status !== 'approved') throw new AppError('Only approved visitors can be checked in.');
  const active = await Visitor.findOne({ phone: visitor.phone, status: 'checked-in', _id: { $ne: visitor._id } });
  if (active) throw new AppError('This visitor already has an active visit.');
  visitor.status = 'checked-in'; visitor.checkedInAt = new Date(); await visitor.save(); await record(visitor, 'checked-in', req.user);
  await visitor.populate(populate); res.json({ visitor });
}));
router.patch('/:id/check-out', allowRoles('receptionist', 'administrator'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id); if (!visitor) throw new AppError('Visitor not found.', 404);
  if (visitor.status !== 'checked-in' || !visitor.checkedInAt) throw new AppError('Only visitors currently inside can be checked out.');
  const checkedOutAt = new Date(req.body.checkedOutAt || Date.now());
  if (Number.isNaN(checkedOutAt.getTime()) || checkedOutAt <= visitor.checkedInAt) throw new AppError('Check-out time must be later than check-in time.');
  visitor.status = 'checked-out'; visitor.checkedOutAt = checkedOutAt; await visitor.save(); await record(visitor, 'checked-out', req.user);
  await visitor.populate(populate); res.json({ visitor });
}));
router.patch('/:id/cancel', allowRoles('receptionist', 'administrator'), asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id); if (!visitor) throw new AppError('Visitor not found.', 404);
  if (!['pending', 'approved'].includes(visitor.status)) throw new AppError('Only pending or approved visits can be cancelled.');
  visitor.status = 'cancelled'; visitor.cancelledAt = new Date(); await visitor.save(); await record(visitor, 'cancelled', req.user);
  await visitor.populate(populate); res.json({ visitor });
}));
export default router;
