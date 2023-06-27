import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import Token from '../../common/interface/token';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { User } from '../../models/user';

export default class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);

      const user = await new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      }).save();

      const token = await signToken(res, user.id, user.email);
      return token;
    } catch (error) {
      return res.status(500).json({ message: 'Dulicate Email!' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      const token = await signToken(res, user.id, user.email);
      return token;
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.body.refreshToken;
    try {
      const verifyToken: any = jwt.verify(refreshToken, process.env.JWT_SECRET);

      const token = await signToken(
        res,
        verifyToken.id,
        verifyToken.email,
        refreshToken,
      );
      return token;
    } catch (error) {
      res.json({ message: error.message });
      return;
    }
  }
}

// Create JWT
export async function signToken(
  res: Response,
  id: object,
  email: string,
  refreshToken?: string,
): Promise<Token | object> {
  const payload = { id, email };

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  const refresh_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  if (refreshToken) {
    const refreshTokenExists = await User.findOne({
      token: refreshToken,
    });
    if (refreshTokenExists) {
      await User.updateOne(
        { _id: refreshTokenExists.id },
        {
          token: refresh_token,
        },
      );
    } else {
      return res.status(400).json({ message: 'Invalid Token' });
    }
  } else {
    await User.updateOne(
      { _id: id },
      {
        token: refresh_token,
      },
    );
  }
  res.json({ access_token, refresh_token });
}
