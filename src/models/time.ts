import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const timeSchema = new Schema({
  start_time: { type: Date, riquired: true },
  end_time: { type: Date, riquired: true },
  room: { type: Schema.Types.ObjectId, ref: 'Room' },
});

export const Time = mongoose.model('Time', timeSchema);
