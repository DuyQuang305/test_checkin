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
      const { firstname, lastname, email, password, avatar } = req.body;

      let hashedPassword = undefined;
      let avatarUser = undefined;

      if (password) {
        hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);
      } else if (req.file) {
        avatarUser = req.file.path;
      }

      await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          firstname,
          lastname,
          email,
          avatar: avatarUser,
          password: hashedPassword,
        },
      );

      return res.json({ mesage: Message.ProfileUpdated });
    } catch (error) {
      return res.status(500).json({error: error.message})
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
