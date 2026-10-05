import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['administrator', 'receptionist', 'employee'], required: true },
  department: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function () { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12); });
userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.password); };
userSchema.methods.toJSON = function () { const obj = this.toObject(); delete obj.password; delete obj.__v; return obj; };
export default mongoose.model('User', userSchema);
