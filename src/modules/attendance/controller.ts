import { NextFunction, Request, Response } from 'express';
import createResponse from '../../common/function/createResponse';

import { Attendance } from '../../models/attendance';
import { Room } from '../../models/room';

export default class AttendanceController {
  async checkin(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { roomId } = req.params;
      const clientIp = req.ip;
      const user = req.user.id;

      const room = await Room.findById(roomId);

      if (clientIp !== room.allowed_ip) {
        return createResponse(
          res,
          400,
          false,
          'Your IP address is not allowed to access this meeting room',
        );
      }
      const now: Date = new Date()
      const attendanceResult = await attendance();

      const existingAttendance = await Attendance.findOne({
        user,
        room: roomId,
        checkIn: {
          $gte: attendanceResult.day,
        },
      });

      if (existingAttendance) {
        return createResponse(res, 400, false, 'You have already checked in earlier');
      } else {
        const attendance = new Attendance({
          user,
          room: roomId,
          checkIn: now,
        });

        const time = room.time.find((time) => {
          return (new Date(time.start_time)).toDateString() === (new Date(attendance.checkIn)).toDateString();
        }) 

        const startTime = time ? time.start_time : null;

        if (!startTime) {
          return createResponse(res, 400, false, 'No attendance schedule today');
        }

        const isLateArrival = attendance.checkIn > startTime;

        attendance.isLateArrival = isLateArrival;

        await attendance.save();

        return createResponse(res, 201, true, 'checkin successfully', attendance);

        
      }
    } catch (err) {
      return createResponse(res, 500, false, err.message);
    }
  }

  async checkout(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { roomId } = req.params;
      const clientIp = req.ip;
      const user = req.user.id;

      const room = await Room.findById(roomId);

      if (clientIp !== room.allowed_ip) {
        return createResponse(
          res,
          400,
          false,
          'Your IP address is not allowed to access this meeting room',
        );
      }

      const now: Date = new Date()
      const attendanceResult = await attendance();

      const attendanceExists = await Attendance.findOne({
        user,
        room: roomId,
      });

      if (!attendanceExists || !attendanceExists.checkIn) {
        return createResponse(res, 400, false, 'You havent checked in yet');
      } else {
        attendanceExists.checkOut = now;

        const time = room.time.find((time) => {
          return (new Date(time.end_time)).toDateString() === (new Date(attendanceExists.checkOut)).toDateString();
        }) 

        const endTime = time ? time.end_time : null;

        if (!endTime) {
          return createResponse(res, 400, false, 'No attendance schedule today');
        }

        const isLeaveEarly = attendanceExists.checkOut < endTime;

        attendanceExists.isLeaveEarly = isLeaveEarly;

        await attendanceExists.save();

        return createResponse(
          res,
          201,
          true,
          'Checkout successfully',
          attendanceExists,
        );
      }
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
}

async function attendance(): Promise<{
  day: Date;
}> {
  const time: Date = new Date();

  const day: Date = new Date(time.setHours(0, 0, 0, 0));

  const attendance = { day };

  return attendance;
}

