import { Request, Response } from 'express';

import { Attendance } from '../../models/attendance';

export default class StatisticController {
  async getAll(req: Request, res: Response): Promise<object> {
    const attendances = await Attendance.find().populate(
      'user',
      ['fullname', 'email', 'phoneNumber', 'role'],
      'User',
    );
    return res.json(attendances);
  }

  async paginate(req: Request, res: Response): Promise<object> {
    const total = await Attendance.countDocuments();

    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const attendances = await Attendance.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('user', ['fullname', 'email', 'phoneNumber', 'role'], 'User');

    return res.json({
      attendances,
      page,
      limit,
      pages: Math.ceil(total / Number(limit)),
    });
  }

  async getOneById(req: Request, res: Response): Promise<object> {
    const { id } = req.params;

    const attendance = await Attendance.findById(id).populate(
      'user',
      ['fullname', 'email', 'phoneNumber', 'role'],
      'User',
    );
    return res.json(attendance);
  }

  async delete(req: Request, res: Response): Promise<object> {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndRemove(id);
    if (attendance === null) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    return res.json({
      message: `Deleted participant by ID = ${id} successfully`,
      attendance,
    });
  }

  async deleteAll(req: Request, res: Response): Promise<object> {
    const attendances = await Attendance.deleteMany({});

    return res.json({
      message: `Deleted participants successfully`,
      attendances,
    });
  }

  async findByDay(req: Request, res: Response): Promise<object> {
    const { key } = req.query;

    try {
      const attendances = await Attendance.find({
        checkIn: { $gte: key },
      }).populate('user', ['fullname', 'email', 'phoneNumber', 'role'], 'User');

      const count = attendances.length;

      return res.json({ attendances, count });
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  async findByUser(req: Request, res: Response): Promise<object> {
    const { key } = req.query;

    try {
      const attendances = await Attendance.find({
        user: key,
      }).populate('user', ['fullname', 'email', 'phoneNumber', 'role'], 'User');

      const count = attendances.length;

      return res.json({ attendances, count });
    } catch (error) {
      return res.status(400).json(error);
    }
  }
}
