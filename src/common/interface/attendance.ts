import { Types } from 'mongoose';
import TimeInterface from './time';
import UserInterface from './user';

export default interface AttendanceInterface {
  checkIn: Date ,
  checkOut:  Date ,
  user: UserInterface,
  room: Types.ObjectId,
  time: TimeInterface
}
