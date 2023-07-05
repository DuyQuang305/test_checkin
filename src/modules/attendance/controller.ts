import { NextFunction, Request, Response } from 'express';

import { Attendance } from '../../models/attendance';
import { Room } from '../../models/room';

export default class AttendanceController {
  async checkin(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const { roomId } = req.params;
      const clientIp  = req.ip;
      const user = req.user.id;

      const room = await Room.findById(roomId);

      if (clientIp !== room.allowed_ip) {
        return res
          .status(400)
          .json({
            msg: 'Your IP address is not allowed to access this meeting room',
          });
      }

      const attendanceResult = await attendance();

      const existingAttendance = await Attendance.findOne({
        user,
        room: roomId,
        checkIn: {
          $gte: attendanceResult.day,
        },
      });

      if (existingAttendance) {
        return res
          .status(400)
          .json({ message: 'You have already checked in earlier' });
      } else {
        const attendance = new Attendance({
          user,
          room: roomId,
          checkIn: attendanceResult.time,
          dayOfWeek: attendanceResult.dayOfWeek,
        });

        const time = room.time.find((t) => t.day === attendance.dayOfWeek);

        const startTime = time ? time.start_time : null;

        if (!startTime) {
          return res.status(400).json({ msg: 'No attendance schedule today' });
        }

        const checkInTime =
          attendance.checkIn.getHours() * 3600 +
          attendance.checkIn.getMinutes() * 60 +
          attendance.checkIn.getSeconds();
        const startTimeTime =
          startTime.getHours() * 3600 +
          startTime.getMinutes() * 60 +
          startTime.getSeconds();

        const isLateArrival = checkInTime > startTimeTime;

        attendance.isLateArrival = isLateArrival;

        await attendance.save();

        return res.status(201).json({ message: 'Checkin successfully' });
      }
    } catch (err) {
      return res.status(500).json(err.message);
    }
  }

  async checkout(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const { roomId } = req.params;
      const clientIp  = req.ip;
      const user = req.user.id;

      const room = await Room.findById(roomId);

      if (clientIp !== room.allowed_ip) {
        return res
          .status(400)
          .json({
            msg: 'Your IP address is not allowed to access this meeting room',
          });
      }

      const attendanceResult = await attendance();

      const attendanceExists = await Attendance.findOne({
        user,
        room: roomId,
      });

      if (!attendanceExists || !attendanceExists.checkIn) {
        return res.status(400).json({ message: "You haven't checked in yet" });
      } else {
        attendanceExists.checkOut = attendanceResult.time;

        const time = room.time.find(
          (t) => t.day === attendanceExists.dayOfWeek,
        );

        const endTime = time ? time.end_time : null;

        if (!endTime) {
          return res.status(400).json({ msg: 'No attendance schedule today' });
        }

        console.log(attendanceExists.checkOut);
        console.log(endTime);

        const checkOutTime =
          attendanceExists.checkOut.getHours() * 3600 +
          attendanceExists.checkOut.getMinutes() * 60 +
          attendanceExists.checkOut.getSeconds();
        const endTimeTime =
          endTime.getHours() * 3600 +
          endTime.getMinutes() * 60 +
          endTime.getSeconds();

        const isLeaveEarly = checkOutTime < endTimeTime;

        attendanceExists.isLeaveEarly = isLeaveEarly;

        console.log(checkOutTime);
        console.log(endTimeTime);

        await attendanceExists.save();
        return res.status(201).json({ message: 'Checkout successfully' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

async function attendance(): Promise<{
  time: Date;
  day: Date;
  dayOfWeek: String;
  dayIndexOfWeek: Number;
}> {
  const now: Date = new Date();

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const dayOfWeek = days[now.getDay()];

  const dayIndexOfWeek: Number = now.getDay();

  const timezoneOffset = 7 * 60 * 60 * 1000;

  const time: Date = new Date(now.getTime() + timezoneOffset);

  const day: Date = new Date(now.setHours(7, 0, 0, 0));

  const attendance = { time, day, dayOfWeek, dayIndexOfWeek };

  return attendance;
}
