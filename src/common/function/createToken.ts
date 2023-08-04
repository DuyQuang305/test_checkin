import {  Response } from 'express';
import jwt from 'jsonwebtoken';

export default async function signToken(
    res: Response,
    id: any,
    email: any,
  ): Promise<any> {
    const payload = { id, email };
  
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '10m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});
  
    res.cookie('jwt', refreshToken, { httpOnly: true, 
                                      sameSite: 'none' as const, secure: true,
                                      maxAge: 24 * 60 * 60 * 1000 })
    return accessToken
  }
  