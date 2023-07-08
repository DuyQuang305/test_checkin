import { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/room';
import { User } from '../../models/user';
import { Time } from '../../models/time';

import sendEmail from '../../services/sendMail';
import getIpAddress from '../../services/IpAddress';

import createResponse from '../../common/function/createResponse';

import checkTime from '../../common/function/checkTime';

require('dotenv').config;

export default class Controller {
  async showRoom(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId)
        .populate('owner', 'firstname lastname avatar')
        .populate('members', 'firstname lastname avatar');
      return createResponse(
        res,
        200,
        true,
        'Get room by id successfully',
        room,
      );
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  async createRoom(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const ipAddress = await getIpAddress();
      const { name, time } = req.body;

      const errorMessages = await checkTime(time);
      if (errorMessages.length > 0) {
        return createResponse(res, 400, false, errorMessages[0]);
      }

      const room = new Room({
        name,
        allowed_ip: ipAddress,
        owner: req.user.id,
      });

      const timeWithRoomIds = time.map((t) => ({ ...t, room: room._id }));

      await Time.insertMany([...timeWithRoomIds]);

      await room.save();
      if (!room) {
        return createResponse(res, 400, false, 'Create room failed');
      }
      return createResponse(res, 201, true, 'Create room successfully', room);
    } catch (error) {
      return createResponse(res, 500, false, error.message);
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

      return createResponse(res, 201, true, 'Invite members successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  //  mời người dùng bằng cách nhập mail
  async addMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { email } = req.body;

      const userExists = await User.findOne({ email: email });

      if (!userExists) {
        return createResponse(res, 400, false, 'Invalid email');
      }

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createResponse(res, 400, false, 'Room not found');
      } else if (roomExists.members.includes(userExists._id)) {
        return createResponse(
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
        return createResponse(res, 400, false, 'Failed to update room time');
      }

      return createResponse(res, 201, true, 'Add members successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
}

// export const checkTime = async (time) => {
//   try {
//     const errors = { startTimeError: false, overlapError: false };

//     for (const t of time) {
//       if (t.start_time >= t.end_time) {
//         errors.startTimeError = true;
//       } else {
//         const overlappingTime = await Time.findOne({
//           $or: [
//             { start_time: { $lte: t.start_time }, end_time: { $gte: t.end_time } },
//             { start_time: { $lte: t.start_time }, end_time: { $gte: t.end_time } },
//             { start_time: { $gte: t.start_time }, end_time: { $lte: t.end_time } }
//           ]
//         }).exec();

//         if (overlappingTime) {
//           errors.overlapError = true;
//         }
//       }
//     }

//     const errorMessages = [];
//     if (errors.startTimeError) {
//       errorMessages.push('The start time must be less than the end time');
//     }
//     if (errors.overlapError) {
//       errorMessages.push('The time period you specified overlaps with an existing time period. Please enter a different time period.');
//     }
//     return errorMessages;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }
