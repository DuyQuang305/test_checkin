import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  allowed_ip: { type: String },
  time: {
    type: [
      {
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
      },
    ],
    required: true,
  },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const Room = mongoose.model('Room', roomSchema);
