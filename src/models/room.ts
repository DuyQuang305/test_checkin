import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  allowed_ip: { type: String },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const Room = mongoose.model('Room', roomSchema);
