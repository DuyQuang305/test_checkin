import { NextFunction, Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { User } from '../../models/user';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { Message } from '../../common/constant/message';

import createResponse from '../../common/function/createResponse';

import cache from '../../services/cache';

import removeExistsFile from '../../middlewares/removeExistsFile';

export default class ProfileController {
  async profile(req: Request, res: Response): Promise<any> {
    return createResponse(res, 200, true, 'Get profile successfully', req.user);
  }

  async editProfile(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { firstname, lastname, password } = req.body;

      let hashedPassword = undefined;
      let avatarUser = undefined;

      const user = await User.findById(req.user.id);

      if (password) {
        hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);
      } else if (req.file) {
        removeExistsFile(user.avatar);
        avatarUser = req.file.path;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            firstname: firstname,
            lastname: lastname,
            avatar: avatarUser,
            password: hashedPassword,
          },
        },
        { new: true },
      );

      return createResponse(res, 201, true, Message.ProfileUpdated);
    } catch (error) {
      return createResponse(res, 500, true, error.message);
    }
  }

  async editEmail(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
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
        cache.del(email);

        return createResponse(
          res,
          201,
          true,
          'Your new email has been confirmed and saved successfully.',
        );
      } else {
        return createResponse(res, 400, false, 'Invalid verification code');
      }
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  async delete(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      await User.deleteOne({ _id: req.user.id });
      return createResponse(res, 204, true, Message.DeletedAccount);
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
}
