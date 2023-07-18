import { Types } from 'mongoose';
import TimeInterface from './time';

export default interface AttendanceInterface {
  checkIn: Date ,
  checkOut:  Date ,
  user: Types.ObjectId,
  room: Types.ObjectId,
  time: TimeInterface
}
