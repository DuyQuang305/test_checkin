import { Request, Response } from 'express';

import createResponse from '../../common/function/createResponse';

import { User } from '../../models/user';
import { Time } from '../../models/time';

export default class TimeController {
  // check time id, check owner
  async changeTime(req: Request | any, res) {
    try {
      const { timeId } = req.params;
      const { start_time, end_time } = req.body;
      const owner = req.user.id;

      const isExistsTime = await Time.findById(timeId)
       .populate({
        path: 'room',
        select: 'owner',
      });
      
      if (!isExistsTime) {
          return createResponse(res, 400, false, 'Time is not found');
      }
    
      const roomOwner = isExistsTime?.room?.owner?.toString();
      
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
