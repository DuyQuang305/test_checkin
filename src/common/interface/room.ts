import { Types } from 'mongoose';
import UserInterface from "./user";

export default interface RoomInterface  {
    name: string;
    allowed_ip?: string;
    members: Array<Types.ObjectId | UserInterface>;
    owner:  Types.ObjectId | UserInterface;
  }