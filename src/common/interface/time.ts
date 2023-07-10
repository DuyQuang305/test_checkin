import { Types } from 'mongoose';

export default interface TimeInterface {
  start_time: Date;
  end_time: Date;
  room: {
    roomId: Types.ObjectId;
    owner: Types.ObjectId;
  };
}
