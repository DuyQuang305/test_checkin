import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { Message } from '../../common/constant/message';

import cache from '../../services/cache';

export default class ProfileController {
  async profile(req: Request, res: Response): Promise<void> {
    res.status(200).json(req.user)
  }

  async editProfile(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const { firstname, lastname, password } = req.body;

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
          avatar: avatarUser,
          password: hashedPassword,
        },
      );

      return res.json({ mesage: Message.ProfileUpdated });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async editEmail(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<object> {
    try {
      const { email, verificationCode } = req.body;

      const user = await User.findById(req.user.id);

      const code = cache.get(user.email);

      if (verificationCode == code) {
        await User.findByIdAndUpdate(
          { _id: req.user.id },
          {
            email,
          },
        );
        return res.status(201).json({ msg: 'Email update successfully' });
      } else {
        return res.status(400).json({
          error: 'Invalid verification code',
          details:
            'The verification code you entered is invalid or has expired. Please check the code and try again.',
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
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
