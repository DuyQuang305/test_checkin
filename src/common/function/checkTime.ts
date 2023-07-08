import { Request, Response } from 'express';
import { Time } from '../../models/time';
export default async function checkTime(time) {
  try {
    const errors = { startTimeError: false, overlapError: false };

    for (const t of time) {
      if (t.start_time >= t.end_time) {
        errors.startTimeError = true;
      } else {
        const overlappingTime = await Time.findOne({
          $or: [
            {
              start_time: { $lte: t.start_time },
              end_time: { $gte: t.end_time },
            },
            {
              start_time: { $lte: t.start_time },
              end_time: { $gte: t.end_time },
            },
            {
              start_time: { $gte: t.start_time },
              end_time: { $lte: t.end_time },
            },
          ],
        }).exec();

        if (overlappingTime) {
          errors.overlapError = true;
        }
      }
    }

    const errorMessages = [];
    if (errors.startTimeError) {
      errorMessages.push('The start time must be less than the end time');
    }
    if (errors.overlapError) {
      errorMessages.push(
        'The time period you specified overlaps with an existing time period. Please enter a different time period.',
      );
    }
    return errorMessages;
  } catch (error) {
    throw new Error(error.message);
  }
}
