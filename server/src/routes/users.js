import { Router } from 'express';
import User from '../models/User.js';
import Visitor from '../models/Visitor.js';
import { authenticate, allowRoles } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { requireFields } from '../middleware/validate.js';

const router = Router();
router.use(authenticate);
router.get('/employees', asyncHandler(async (req, res) => {
  const rows = await User.find({ role: 'employee', active: true }).select('name email department').sort('name');
  res.json({ employees: rows });
}));
router.get('/', allowRoles('administrator'), asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }); res.json({ users });
}));
router.post('/', allowRoles('administrator'), requireFields('name', 'email', 'password', 'role'), asyncHandler(async (req, res) => {
  const { name, email, password, role, department = '' } = req.body;
  if (!['administrator', 'receptionist', 'employee'].includes(role)) throw new AppError('Select a valid role.');
  if (password.length < 8) throw new AppError('Password must be at least 8 characters.');
  const user = await User.create({ name, email, password, role, department }); res.status(201).json({ user });
}));
router.patch('/:id', allowRoles('administrator'), asyncHandler(async (req, res) => {
  const { name, email, role, department, active, password } = req.body;
  if (role && !['administrator', 'receptionist', 'employee'].includes(role)) throw new AppError('Select a valid role.');
  if (req.params.id === req.user.id && active === false) throw new AppError('You cannot deactivate your own account.');
  const user = await User.findById(req.params.id).select('+password'); if (!user) throw new AppError('User not found.', 404);
  for (const [key, value] of Object.entries({ name, email, role, department, active })) if (value !== undefined) user[key] = value;
  if (password) { if (password.length < 8) throw new AppError('Password must be at least 8 characters.'); user.password = password; }
  await user.save(); res.json({ user });
}));
router.get('/:id/workload', allowRoles('administrator'), asyncHandler(async (req, res) => {
  const count = await Visitor.countDocuments({ employee: req.params.id, status: 'pending' }); res.json({ pending: count });
}));
export default router;
