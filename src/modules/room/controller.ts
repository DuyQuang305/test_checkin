import { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/room';
import { User } from '../../models/user';

import sendEmail from '../../services/sendMail';
import getIpAddress from '../../services/IpAddress';

require('dotenv').config;

export default class Controller {
  async createRoom(req: Request | any, res: Response, next: NextFunction) {
    try {
      const ipAddress = await getIpAddress();
      const { name, time } = req.body;

      const room = new Room({
        name,
        allowed_ip: ipAddress,
        time,
        owner: req.user.id,
      });

      await room.save();
      if (!room) {
        return res.status(400).json({ msg: 'Create room failed' });
      }
      return res.status(201).json({ msg: 'Create room successfully', room });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  //  mời người dùng bằng cách nhập mail
  async inviteMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId, emails } = req.body;

      emails.forEach((email) => {
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Invite to join checkin',
          text: `You have been invited to join a room for check-in. Please click on the following link to access the room: ${process.env.URL_SERVER}/room/${roomId}`,
        };

        sendEmail(mailOptions);
      });

      return res.status(201).json({ msg: 'Invite members successfully' });
    } catch {
      return res.status(401).json({ msg: 'Create room failed' });
    }
  }

  //  mời người dùng bằng cách nhập mail
  async addMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { email } = req.body;

      const emailExists = await User.findOne({ email: email });

      if (!emailExists) {
        return res.status(400).json({ msg: 'Invalid email' });
      }

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return res.status(400).json({ msg: 'Room not found' });
      }

      const updateRoom = await Room.updateOne(
        { _id: roomId },
        { $push: { members: roomExists._id } },
      );

      if (!updateRoom) {
        return res.status(500).json({ msg: 'Failed to update room time' });
      }

      return res.status(201).json({ msg: 'Invite members successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async addTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { time } = req.body;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return res.status(400).json({ msg: 'Room not found' });
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId },
        { $push: { time: { $each: [...time] } } },
      );

      if (!updatedRoom) {
        return res.status(500).json({ msg: 'Failed to update room time' });
      }

      return res.status(201).json({
        msg: 'The time for the meeting room has been successfully updated',
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  async changeTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId, timeId } = req.params;
      const { time } = req.body;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return res.status(400).json({ msg: 'Room not found' });
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId, 'time._id': timeId },
        { $set: { 'time.$': time[0] } },
      );

      if (!updatedRoom) {
        return res.status(500).json({ msg: 'Failed to change room time' });
      }

      return res.status(201).json({
        msg: 'The time for the meeting room has been successfully updated',
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  async deleteTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId, timeId } = req.params;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return res.status(400).json({ msg: 'Room not found' });
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId },
        { $pull: { time: { _id: timeId } } },
      );

      if (!updatedRoom) {
        return res.status(500).json({ msg: 'Failed to delete room time' });
      }

      return res.status(201).json({
        msg: 'The time for the meeting room has been successfully deleted',
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
