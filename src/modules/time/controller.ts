import { Request, Response } from 'express';

import createResponse from '../../common/function/createResponse';
import checkTime from '../../common/function/checkTime';
import TimeInterface from '../../common/interface/time';

import { User } from '../../models/user';
import { Time } from '../../models/time';
import { Room } from '../../models/room';

export default class TimeController {
  async showTimeByRoom(
    req: Request,
    res: Response,
    next,
  ): Promise<any> {
    try {
      const { roomId } = req.params;

      const room = Room.findById(roomId);
      const time = Time.find({ room: roomId });

      const allPromise = Promise.all([room, time]);
      
      try {
        const [room, time] = await allPromise;

        if (!room) {
          return createResponse(res, 400, false, 'Room not found');
        }

        if (!time) {
          return createResponse(
            res,
            400,
            false,
            'There is no schedule for this meeting room yet.',
          );
        }

        createResponse(
          res,
          200,
          true,
          'This is the schedule of this meeting room',
          time,
        );
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
  /**
   * @swagger
   * /time/add-time/{roomId}:
   *   post:
   *     tags:
   *       - Time
   *     summary: "Add the start and end time of the room"
   *     description: "Add the start and end time of the room"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: time
   *         description: time to update
   *         schema:
   *           type: object
   *           propertise:
   *             - start_time:
   *                 type: date
   *                 description: New start_time
   *             - end_time:
   *                 type: date
   *                 description: New end_time
   *           example:
   *             "time": [
   *                       {
   *                           "start_time": "2023-07-14T05:00:00.00Z",
   *                           "end_time": "2023-07-14T10:00:00.00Z"
   *                       }
   *                     ]                 
   *       - in: path
   *         name: roomId
   *         schema: 
   *           type: string   
   *         example: 64a7e2a6e4fd64dfbe93961a  
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
   *              example: false
   *             message:
   *              type: string
   */
  async addTime (req: Request | any, res: Response): Promise<any>{
    try {
      const {roomId} = req.params
      const {time} = req.body
      const user = req.user.id
      
      const room = await Room.findById(roomId)

      const owner = room.owner.toString();

    //  if (user !== owner) {
    //   return createResponse(res, 403, false, 'To add time, the user must be the owner of the room.')
    //  }

      const errorMessages = await checkTime(time);
      if (errorMessages.length > 0) {
        return createResponse(res, 400, false, errorMessages[0]);
      }
  
      const timeWithRoomIds = time.map((t) => ({ ...t, room: roomId }));
  
      try {
        await Time.insertMany([...timeWithRoomIds]);
      } catch(error) {
        return createResponse(res, 400, false, error.message)
      }

      return createResponse(res, 201, true, 'Add time successfully')
    } catch (error) {
      return createResponse(res, 500, false, error.message)
    }
   
  }


  /**
   * @swagger
   * /time/{timeId}:
   *   patch:
   *     tags:
   *       - Time
   *     summary: "Modify the start or end time of the room"
   *     description: "Modify the start or end time of the room by start time and end time"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: time
   *         description: time to update
   *         schema:
   *           type: object
   *           propertise:
   *             - start_time:
   *                 type: date
   *                 description: New start_time
   *             - end_time:
   *                 type: date
   *                 description: New end_time
   *           example:
   *             start_time: 2023-07-08T01:00:00.00Z
   *             end_time: 2023-07-08T03:30:00.00Z
   *       - in: path
   *         name: timeId
   *         required: true
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
   *             message:
   *               type: string
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
   *              example: false
   *             message:
   *              type: string
   */

  async changeTime(req: Request | any, res) {
    try {
      const { timeId } = req.params;
      const { start_time, end_time } = req.body;
      const owner = req.user.id;

      const isExistsTime: TimeInterface = await Time.findById(timeId).populate({
        path: 'room',
        select: 'owner',
      });

      if (!isExistsTime) {
        return createResponse(res, 400, false, 'Time is not found');
      }

      const roomOwner = isExistsTime?.room?.owner.toString();

      if (roomOwner != owner) {
        return createResponse(
          res,
          403,
          false,
          'You are not authorized to change the time',
        );
      }

      const isValidTime = start_time < end_time;

      if (!isValidTime) {
        return createResponse(
          res,
          400,
          false,
          'The start time must be less than the end time',
        );
      }

      const overlappingTime = await Time.findOne({
        $or: [
          { start_time: { $lte: start_time }, end_time: { $gte: end_time } },
          { start_time: { $lte: start_time }, end_time: { $gte: end_time } },
          { start_time: { $gte: start_time }, end_time: { $lte: end_time } },
        ],
      });

      if (overlappingTime) {
        return createResponse(
          res,
          400,
          false,
          'The time period you specified overlaps with an existing time period. Please enter a different time period.',
        );
      }

      await Time.findByIdAndUpdate(timeId, {
        start_time,
        end_time,
      });

      return createResponse(res, 201, true, 'Updated time successfully');
    } catch (error) {
      return createResponse(res, 400, false, error.message);
    }
  }
}
