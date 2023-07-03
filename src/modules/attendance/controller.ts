import { NextFunction, Request, Response } from 'express';

import { Attendance } from '../../models/attendance';
import { Room } from '../../models/room'

export default class AttendanceController {
  async checkin(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const {roomId} = req.params
      const user = req.user.id;

      const room = await Room.findById(roomId)

      const attendanceResult = await attendance();

      console.log(attendanceResult.time);
      console.log(attendanceResult.dayOfWeek);


      const existingAttendance = await Attendance.findOne({
        user,
        room: roomId,
        checkIn: {
          $gte: attendanceResult.day
        }
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
          dayOfWeek: attendanceResult.dayOfWeek
        }); 
       
        

        await attendance.save();

        return res.status(201).json({ message: 'Checkin successfully' });
      }
    } catch (err) {
      return res.status(500).json(err.message)
    }
  }

  async checkout(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const user = req.user.id;

      const attendanceResult = await attendance();

      // Finish Time 17h30
      const finishTime = new Date();

      finishTime.setUTCHours(17);
      finishTime.setUTCMinutes(30);
      finishTime.setUTCSeconds(0);

      const existingAttendance = await Attendance.findOne({
        user,
        checkIn: {
          $gte: attendanceResult.dayOfWeek,
        },
      });

      if (!existingAttendance) {
        return res.status(400).json({ message: "You haven't checked in yet" });
      } else {
        existingAttendance.checkOut = attendanceResult.time;
        console.log(existingAttendance.checkOut);
        console.log(finishTime);

        if (Number(existingAttendance.checkOut) - Number(finishTime) < 0) {
          existingAttendance.isLeaveEarly = true;
        }

        await existingAttendance.save();

        return res.status(201).json({ message: 'Checkout successfully' });
      }
    } catch (err) {
      next(err);
    }
  }
}

async function attendance(): Promise<{ time: Date; day: Date ; dayOfWeek: String }> {
  const now: Date = new Date();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayOfWeek = days[now.getDay()];

  const timezoneOffset = 7 * 60 * 60 * 1000;
 
  const time: Date = new Date(now.getTime() + timezoneOffset);

  const day: Date = new Date(now.setHours(7,0,0,0))

  const attendance = { time, day ,dayOfWeek };

  return attendance;
}

async function isAllowedIps(ip) {

}
