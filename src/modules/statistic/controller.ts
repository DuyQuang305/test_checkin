import { Request, Response } from 'express';
import mongoose from 'mongoose'

import createResponse from '../../common/function/createResponse';

import { Attendance } from '../../models';

import AttendanceInterface from '../../common/interface/attendance';

export default class StatisticController {
  /**
   * @swagger
   * /statistic/history:
   *   get:
   *     tags:
   *       - Statistic
   *     summary: "Get attendance history and paginate page"
   *     description: "Get attendance history and paginate page"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: currentPage
   *         schema: 
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: Get Successfully
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Get history attendance failed"
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 401
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
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
   *              example: false
   *             message:
   *              type: string
   *              example: "Server internal error"
   */

  async attendanceHistory(req: Request | any, res: Response) {
    try {
      const {limit, currentPage} = req.query

      const attendanceCount = await Attendance.countDocuments({})
      const pageLimit = parseInt(limit) || 5
      const skipCount = pageLimit * ((currentPage <= 0 ? 1 : currentPage) - 1);
  
      const pageCount = Math.ceil(attendanceCount / pageLimit);
      const attendance = await Attendance.find({})
                                         .populate('user', 'firstname lastname')
                                         .populate('room', 'name')
                                         .skip(skipCount)
                                         .limit(limit)
                                         .lean();
      
      if (!attendance) {
        return createResponse(res, 400, false, 'attendance not found');
      }
  
      return createResponse(res, 200, true, 'get attendance history successfully', attendance, attendanceCount, pageCount)
    } catch (error) {
      return createResponse(res, 500, false, error.message)
    }
  } 

  /**
   * @swagger
   * /statistic/history-me:
   *   get:
   *     tags:
   *       - Statistic
   *     summary: "Get your attendance history"
   *     description: "Get your attendance history"
   *     security: 
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: Get Successfully
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Get history attendance failed"
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 401
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
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
   *              example: false
   *             message:
   *              type: string
   *              example: "Server internal error"
   */

  async myAttendanceHistory(req: Request | any, res: Response): Promise<any> {
    const user = req.user.id;
    const attendances = await Attendance.find({user})
      .populate('room', 'name')
      .populate('user', 'firstname lastname')
      .lean();
    return createResponse(
      res,
      200,
      true,
      'Get Your Attendance History successfully',
      attendances,
    );
  }

  /**
   * @swagger
   * /statistic/find-by-user/{userId}:
   *   get:
   *     tags:
   *       - Statistic
   *     summary: "Get infomation attendance history of a person"
   *     description: "Get infomation attendance history of a person"
   *     security: 
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: Get Successfully
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Get history attendance failed"
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 401
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
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
   *              example: false
   *             message:
   *              type: string
   *              example: "Server internal error"
   */

  async AttendanceHistoryPerson(req: Request | any, res: Response): Promise<any> {
    const {id} = req.params;
    const attendances = await Attendance.find({user: id})
      .populate('user', 'firstname lastname')
      .lean();
    return createResponse(
      res,
      200,
      true,
      'Get Attendance History Of a Person successfully',
      attendances,
    );
  }

  /**
   * @swagger
   * /statistic/attendance-by-room/{roomId}:
   *   get:
   *     tags:
   *       - Statistic
   *     summary: "Get infomation attendance history by room"
   *     description: "Get infomation attendance history by room"
   *     security: 
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: Get Successfully
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Get history attendance failed"
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 401
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
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
   *              example: false
   *             message:
   *              type: string
   *              example: "Server internal error"
   */
  async attendanceByRoom(req: Request, res: Response): Promise<any> {
    const { roomId } = req.params;
    const attendances = await Attendance.find({room: roomId})
      .populate('room', 'name')
      .populate('user', 'firstname lastname')
      .lean();

    return createResponse(
      res,
      200,
      true,
      'Get Attendance History By Room successfully',
      attendances,
    );
  }

  async lateEarlyArrival(req: Request | any, res: Response): Promise<Object> {
    const {userId, roomId, month, year} = req.params

    const nextMonth: number = Number(month) + 1
    const firstMonth: Date = new Date(`${year}-0${month}-01T00:00:00.000Z`) 
    const endOfMonth: Date = new Date(`${year}-0${nextMonth}-01T00:00:00.000Z`) 

    let totalArrivalEarlyMinutes = 0;
    let totalArrivalLateMinutes = 0;

    const attendance: AttendanceInterface[] = await Attendance.find({
      room: roomId,
      user: userId, 
      checkIn: { $gte: new Date(firstMonth),
                 $lt: new Date(endOfMonth) }
    }).populate('time', 'start_time end_time');

    attendance.forEach(attendanceEntry => {

      const checkIn = new Date(attendanceEntry.checkIn);
      const startTime = attendanceEntry.time.start_time
      const endTime = attendanceEntry.time.end_time 
    
      if (startTime && endTime) {
        if (checkIn < startTime) {
          const earlyMinutes = Math.round(Number(startTime) - Number(checkIn) / 60000);
          totalArrivalEarlyMinutes += earlyMinutes;
        } else if (checkIn > startTime) {
          const lateMinutes = Math.round(Number(checkIn) - Number(startTime)) / 60000;
          totalArrivalLateMinutes += lateMinutes;
        }
      }
    });

    
    

    return res.json({attendance, totalArrivalEarlyMinutes, totalArrivalLateMinutes})
    
  }
}
