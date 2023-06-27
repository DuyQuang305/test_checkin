import { NextFunction, Request, Response } from 'express';

import { Attendance } from '../../models/attendance';

export default class AttendanceController {
  async checkin(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const user = req.user.id;

      const startTime: Date = new Date();

      startTime.setHours(8);
      startTime.setMinutes(0);
      startTime.setSeconds(0);

      const attendanceResult = await attendance();

      const existingAttendance = await Attendance.findOne({
        user: user,
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
          user: user,
          checkIn: attendanceResult.time,
        });

        if (Number(attendance.checkIn) - Number(startTime) > 0) {
          attendance.isLateArrival = true;
        }

        await attendance.save();

        return res.status(201).json({ message: 'Checkin successfully' });
      }
    } catch (err) {
      next(err);
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

      finishTime.setHours(17);
      finishTime.setMinutes(30);
      finishTime.setSeconds(0);

      const existingAttendance = await Attendance.findOne({
        user,
        checkIn: {
          $gte: attendanceResult.day,
        },
      });

      if (!existingAttendance) {
        return res.status(400).json({ message: "You haven't checked in yet" });
      } else {
        existingAttendance.checkOut = attendanceResult.time;

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

async function attendance(): Promise<{ time: Date; day: Date }> {
  const now: Date = new Date();
  const timezoneOffset = 7 * 60 * 60 * 1000;
  const time: Date = new Date(now.getTime() + timezoneOffset);
  const day = new Date(now.setHours(12, 0, 0, 0));
  const attendance = { time, day };

  return attendance;
}
