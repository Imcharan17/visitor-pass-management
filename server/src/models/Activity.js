import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  visitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  action: { type: String, enum: ['created', 'approved', 'rejected', 'checked-in', 'checked-out', 'cancelled', 'remarked'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String, trim: true, default: '' }
}, { timestamps: true });
activitySchema.index({ visitor: 1, createdAt: -1 });
export default mongoose.model('Activity', activitySchema);
