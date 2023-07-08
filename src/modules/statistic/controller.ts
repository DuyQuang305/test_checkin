import { Request, Response } from 'express';

import createResponse from '../../common/function/createResponse';

import { Attendance } from '../../models/attendance';

export default class StatisticController {
  async attendanceHistory(req: Request, res: Response): Promise<any> {
    const user = req.user;
    const attendances = await Attendance.find({ user })
      .populate('room', 'name')
      .populate('user', 'firstname lastname')
      .lean();
    return createResponse(
      res,
      200,
      true,
      'Get Attendance History successfully',
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

  // async attendanceByDay(req: Request, res: Response): Promise<any> {
  //   const day: string = req.query.day;
  //   const attendanceDay: Date = new Date(day)
  //   const attendances = await Attendance.find({})
  //     .populate('room', 'name')
  //     .populate('user', 'firstname lastname')
  //     .lean();

  //   return createResponse(
  //     res,
  //     200,
  //     true,
  //     'Get Attendance History By Day Of Week successfully',
  //     attendances,
  //   );
  // }

  async lateArrivals(req: Request, res: Response): Promise<any> {
    const lateArrivals = await Attendance.find(
      { isLateArrival: true },
      { user: req.user },
    ).count();

    return createResponse(
      res,
      200,
      true,
      'The number of late arrivals is:',
      lateArrivals,
    );
  }

  async leaveEarly(req: Request, res: Response): Promise<any> {
    const leaveEarly = await Attendance.find(
      { isLeaveEarly: true },
      { user: req.user },
    ).count();

    return createResponse(
      res,
      200,
      true,
      'The number of early days off work is:',
      leaveEarly,
    );
  }

  async lateArrivalsByUser(req: Request, res: Response): Promise<any> {
    const user = req.query.user;
    const lateArrivals = await Attendance.find(
      { isLateArrival: true },
      { user },
    ).count();

    return createResponse(
      res,
      200,
      true,
      'The number of late arrivals is:',
      lateArrivals,
    );
  }

  async leaveEarlyByUser(req: Request, res: Response): Promise<any> {
    const user = req.query.user;
    const leaveEarly = await Attendance.find(
      { isLeaveEarly: true },
      { user },
    ).count();

    return createResponse(
      res,
      200,
      true,
      'The number of early days off work is:',
      leaveEarly,
    );
  }
}
