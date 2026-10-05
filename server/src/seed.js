import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';

await connectDB();
const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
let user = await User.findOne({ email });
if (!user) user = await User.create({ name: process.env.ADMIN_NAME || 'System Administrator', email, password, role: 'administrator' });
console.log(`Administrator ready: ${user.email}`);
process.exit(0);
