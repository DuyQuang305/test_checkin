import { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/room';
import { User } from '../../models/user';

import sendEmail from '../../services/sendMail';
import getIpAddress from '../../services/IpAddress';

import createRespones from '../../common/function/createResponse';

require('dotenv').config;

export default class Controller {
  async showRoom(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId)
        .populate('owner', 'firstname lastname avatar')
        .populate('members', 'firstname lastname avatar');
      return createRespones(
        res,
        200,
        true,
        'Get room by id successfully',
        room,
      );
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }

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
        return createRespones(res, 400, false, 'Create room failed');
      }
      return createRespones(res, 201, true, 'Create room successfully', room);
    } catch (error) {
      return createRespones(res, 500, false, error.message);
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

      return createRespones(res, 201, true, 'Invite members successfully');
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }

  //  mời người dùng bằng cách nhập mail
  async addMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { email } = req.body;

      const userExists = await User.findOne({ email: email });

      if (!userExists) {
        return createRespones(res, 400, false, 'Invalid email');
      }

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createRespones(res, 400, false, 'Room not found');
      } else if (roomExists.members.includes(userExists._id)) {
        return createRespones(
          res,
          400,
          false,
          'This member has already joined the room before',
        );
      }

      const updateRoom = await Room.updateOne(
        { _id: roomId },
        { $push: { members: userExists._id } },
      );

      if (!updateRoom) {
        return createRespones(res, 400, false, 'Failed to update room time');
      }

      return createRespones(res, 201, true, 'Add members successfully');
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }

  async addTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { time } = req.body;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createRespones(res, 400, false, 'Room not found');
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId },
        { $push: { time: { $each: [...time] } } },
      );

      if (!updatedRoom) {
        return createRespones(res, 400, false, 'Failed to update room time');
      }

      return createRespones(
        res,
        201,
        true,
        'The time for the meeting room has been successfully updated',
      );
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }

  async  changeTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId, timeId } = req.params;
      const { time } = req.body;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createRespones(res, 400, false, 'Room not found');
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId, 'time._id': timeId },
        { $set: { 'time.$': time[0] } },
      );

      if (!updatedRoom) {
        return createRespones(res, 400, false, 'Failed to change room time');
      }

      return createRespones(
        res,
        201,
        true,
        'The time for the meeting room has been successfully updated',
      );
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }

  async deleteTime(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId, timeId } = req.params;

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createRespones(res, 400, false, 'Room not found');
      }

      const updatedRoom = await Room.updateOne(
        { _id: roomId },
        { $pull: { time: { _id: timeId } } },
      );

      if (!updatedRoom) {
        return createRespones(res, 400, false, 'Failed to delete room time');
      }

      return createRespones(
        res,
        201,
        true,
        'The time for the meeting room has been successfully deleted',
      );
    } catch (error) {
      return createRespones(res, 500, false, error.message);
    }
  }
}
