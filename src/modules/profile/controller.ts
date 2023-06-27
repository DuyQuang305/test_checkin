import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { Message } from '../../common/constant/message';

export default class ProfileController {
  async profile(req: Request, res: Response): Promise<void> {
    res.json(req.user);
  }

  async edit(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const { fullname, email, phoneNumber, address, password } = req.body;

      let hashedPassword = undefined;

      if (password) {
        hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);
      }

      await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          fullname,
          email,
          phoneNumber,
          address,
          password: hashedPassword,
        },
      );

      return res.json({ mesage: Message.ProfileUpdated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request | any, res: Response, next: NextFunction) {
    try {
      await User.deleteOne({ _id: req.user.id });
      return res.json({ message: Message.DeletedAccount });
    } catch (error) {
      next(error);
    }
  }
}
