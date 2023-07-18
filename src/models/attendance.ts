import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  checkIn: { type: Date },
  checkOut: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  time: { type: Schema.Types.ObjectId, ref: 'Time', required: true }
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);
