import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  checkIn: { type: Date },
  checkOut: { type: Date },
  dayOfWeek: { type: String },
  isLateArrival: { type: Boolean, default: false },
  isLeaveEarly: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);
