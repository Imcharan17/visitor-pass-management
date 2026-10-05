import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  company: { type: String, trim: true, default: '' },
  idType: { type: String, enum: ['National ID', 'Passport', 'Driving licence', 'Other'], default: 'National ID' },
  idNumber: { type: String, trim: true, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitDate: { type: Date, required: true },
  arrivalTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  purpose: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out', 'cancelled'], default: 'pending' },
  remarks: { type: String, trim: true, maxlength: 500, default: '' },
  approvedAt: Date,
  checkedInAt: Date,
  checkedOutAt: Date,
  cancelledAt: Date
}, { timestamps: true });

visitorSchema.index({ phone: 1, visitDate: 1 });
visitorSchema.index({ employee: 1, status: 1 });
export default mongoose.model('Visitor', visitorSchema);
