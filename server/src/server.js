import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import visitorRoutes from './routes/visitors.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import activityRoutes from './routes/activity.js';
import { errorHandler } from './utils/errors.js';

const app = express();
app.use(helmet());
const allowedOrigins = [...new Set([
  ...(process.env.CLIENT_URL || '').split(',').map(origin => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])];
app.use(cors({ origin: (origin, callback) => {
  const localDevelopmentOrigin = origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (!origin || allowedOrigins.includes(origin) || localDevelopmentOrigin) return callback(null, true);
  callback(new Error('Origin not allowed by CORS'));
} }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 20 : 1000,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
}));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity', activityRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
connectDB().then(() => app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`)))
  .catch(error => { console.error('Unable to start API:', error.message); process.exit(1); });
