import { Request, Response } from 'express';

import createResponse from '../../common/function/createResponse';

import { Attendance } from '../../models/attendance';

export default class StatisticController {

  /**
   * @swagger
   * /room/{roomId}:
   *   get:
   *     tags:
   *       - Statistic
   *     summary: "Get history attendance of room"
   *     description: "Get infomation room"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roomId
   *         description: "The roomId of the room to get infomation room"
   *         schema:
   *           type: string
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
   *                example: "Get infomation room failed"
   *       401:
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
   *             data:
   *              type: object
   */

  async myAttendanceHistory(req: Request | any, res: Response): Promise<any> {
    const user = req.user.id;
    const attendances = await Attendance.findOne({user})
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

  async AttendanceHistoryPerson(req: Request | any, res: Response): Promise<any> {
    const {id} = req.params;
    const attendances = await Attendance.findOne({user: id})
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

  async attendanceByRoom(req: Request, res: Response): Promise<any> {
    const { room } = req.params;
    const attendances = await Attendance.find({ room })
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
}
