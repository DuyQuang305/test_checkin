import { Request, Response } from 'express';

import { Attendance } from '../../models/attendance';

export default class StatisticController {

  async attendanceHistory(req: Request, res: Response): Promise<object> {
    const user = req.user
    const attendances = await Attendance.find({user})
                              .populate( 'room', 'name')
                              .populate('user','firstname lastname')
                              .lean()
    return res.status(200).json(attendances);
  }

  async attendanceByRoom(req: Request, res: Response): Promise<object> {
    const {room} = req.params
    const attendances = await Attendance.find({room})
                              .populate( 'room', 'name')
                              .populate('user','firstname lastname')
                              .lean()
    return res.status(200).json(attendances);
  }

  async attendanceByDayOfWeek(req: Request, res: Response): Promise<object> {
    const dayOfWeek = req.query.dayOfWeek
    const attendances = await Attendance.find({dayOfWeek})
                              .populate( 'room', 'name')
                              .populate('user','firstname lastname')
                              .lean()
    return res.status(200).json(attendances);
  }

   async lateArrivals(req: Request, res: Response): Promise<object> {
      const lateArrivals = await Attendance.find({isLateArrival: true}, {user: req.user}).count();
      return res.status(200).json({msg: 'The number of late arrivals is:', lateArrivals});
  }

  async leaveEarly(req: Request, res: Response): Promise<object> {
    const leaveEarly = await Attendance.find({isLeaveEarly: true}, {user: req.user}).count();
    return res.status(200).json({msg: 'The number of early days off work is:', leaveEarly});
}

async lateArrivalsByUser(req: Request, res: Response): Promise<object> {
  const user = req.query.user
  const lateArrivals = await Attendance.find({isLateArrival: true}, {user}).count();
  return res.status(200).json({msg: 'The number of late arrivals is:', lateArrivals});
}

async leaveEarlyByUser(req: Request, res: Response): Promise<object> {
  const user = req.query.user
const leaveEarly = await Attendance.find({isLeaveEarly: true}, {user}).count();
return res.status(200).json({msg: 'The number of early days off work is:', leaveEarly});
}



  // async getOneById(req: Request, res: Response): Promise<object> {
  //   const { id } = req.params;

  //   const attendance = await Attendance.findById(id).populate(
  //     'user',
  //     ['fullname', 'email', 'phoneNumber', 'role'],
  //     'User',
  //   );
  //   return res.json(attendance);
  // }

  // async delete(req: Request, res: Response): Promise<object> {
  //   const { id } = req.params;

  //   const attendance = await Attendance.findByIdAndRemove(id);
  //   if (attendance === null) {
  //     return res.status(404).json({ message: 'Attendance not found' });
  //   }

  //   return res.json({
  //     message: `Deleted participant by ID = ${id} successfully`,
  //     attendance,
  //   });
  // }

  // async deleteAll(req: Request, res: Response): Promise<object> {
  //   const attendances = await Attendance.deleteMany({});

  //   return res.json({
  //     message: `Deleted participants successfully`,
  //     attendances,
  //   });
  // }

  // async findByDay(req: Request, res: Response): Promise<object> {
  //   const { key } = req.query;

  //   try {
  //     const attendances = await Attendance.find({
  //       checkIn: { $gte: key },
  //     }).populate('user', ['fullname', 'email', 'phoneNumber', 'role'], 'User');

  //     const count = attendances.length;

  //     return res.json({ attendances, count });
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // }

  // async findByUser(req: Request, res: Response): Promise<object> {
  //   const { key } = req.query;

  //   try {
  //     const attendances = await Attendance.find({
  //       user: key,
  //     }).populate('user', ['fullname', 'email', 'phoneNumber', 'role'], 'User');

  //     const count = attendances.length;

  //     return res.json({ attendances, count });
  //   } catch (error) {
  //     return res.status(400).json(error);
  //   }
  // }
}
