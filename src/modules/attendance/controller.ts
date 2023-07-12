import { NextFunction, Request, Response } from 'express';
import createResponse from '../../common/function/createResponse';

import { Attendance } from '../../models/attendance';
import { Room } from '../../models/room';
import { Time } from '../../models/time';

export default class AttendanceController {

  /**
   * @swagger
   * /attendance/checkin/{roomId}:
   *   post:
   *     tags:
   *       - Attendance
   *     summary: "Checkin"
   *     description: "Check in when user arrive"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roomId
   *         schema: 
   *           type: string
   *         require: true
   *         description: Room to check in
   *       - in: header
   *         name: X-Forwarded-For
   *         require: true
   *         schema: 
   *           type: string 
   *         description: "The client IP address"
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *               example: "Check in successfully"
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       401:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 401
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *              example: "Unauthorization"
   *       403:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 403
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *              example: "Forbidden"
   *       500:
   *         description: "Server internal error"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   */
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

      const isMember = room.members.some((member) => {
        return (member = user);
      });

      if (!isMember) {
        return createResponse(
          res,
          403,
          false,
          'Sorry, you are not a member of this class and are not allowed to check-in',
        );
      }

      if (clientIp !== room.allowed_ip) {
        return createResponse(
          res,
          400,
          false,
          'Your IP address is not allowed to access this meeting room',
        );
      }
      const now: Date = new Date();
      const attendanceResult = await attendance();

      const existingAttendance = await Attendance.findOne({
        user,
        room: roomId,
        checkIn: {
          $gte: attendanceResult.day,
        },
      });

      if (existingAttendance) {
        return createResponse(
          res,
          400,
          false,
          'You have already checked in earlier',
        );
      } else {
        const attendance = new Attendance({
          user,
          room: roomId,
          checkIn: now,
        });

        const schedule = await Time.find({ room: roomId });

        const time = schedule.find((time) => {
          return (
            new Date(time.start_time).toDateString() ===
            new Date(attendance.checkIn).toDateString()
          );
        });

        const startTime = time ? time.start_time : null;

        if (!startTime) {
          return createResponse(
            res,
            400,
            false,
            'No attendance schedule today',
          );
        }

        const isLateArrival = attendance.checkIn > startTime;

        attendance.isLateArrival = isLateArrival;

        await attendance.save();

        return createResponse(
          res,
          201,
          true,
          'checkin successfully',
          attendance,
        );
      }
    } catch (err) {
      return createResponse(res, 500, false, err.message);
    }
  }

  /**
   * @swagger
   * /attendance/checkout/{roomId}:
   *   post:
   *     tags:
   *       - Attendance
   *     summary: "Checkout"
   *     description: "Check out when user go home"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roomId
   *         schema: 
   *           type: string
   *         require: true
   *         description: Room to check in
   *       - in: header
   *         name: X-Forwarded-For
   *         require: true
   *         schema: 
   *           type: string 
   *         description: "The client IP address"
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *               example: "Checkout successfully"
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       401:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 401
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *              example: "Unauthorization"
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *             message:
   *              type: string
   */

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

      const now: Date = new Date();
      const attendanceResult = await attendance();

      const attendanceExists = await Attendance.findOne({
        user,
        room: roomId,
        checkIn: {
          $gte: attendanceResult.day,
        },
      });

      if (!attendanceExists || !attendanceExists.checkIn) {
        return createResponse(res, 400, false, 'You havent checked in yet');
      } else {
        attendanceExists.checkOut = now;

        const schedule = await Time.find({ room: roomId });

        const time = schedule.find((time) => {
          return (
            new Date(time.end_time).toDateString() ===
            new Date(attendanceExists.checkOut).toDateString()
          );
        });

        const endTime = time ? time.end_time : null;

        if (!endTime) {
          return createResponse(
            res,
            400,
            false,
            'No attendance schedule today',
          );
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
