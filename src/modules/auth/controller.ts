import { NextFunction, Request, response, Response } from 'express';
import jwt, { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import Token from '../../common/interface/token';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { User } from '../../models';

import createResponse from '../../common/function/createResponse';

import cache from '../../services/cache';
import { create } from 'express-handlebars';
import { AnyObject } from 'yup';
const transporter = require('../../services/nodeMailer');

export default class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: "Create a new user"
   *     description: "Create new user by email and password"
   *     parameters:
   *       - in: body
   *         description: "The user to create."
   *         schema:
   *           type: object
   *           required:
   *             - email
   *             - properties
   *           properties:
   *             firstname:
   *               type: string
   *             lastname:
   *               type: string
   *             email:
   *               type: string
   *             password:
   *               type: string
   *     responses:
   *       201:
   *         description: "Create user successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *       400:
   *          description: "Create user failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 400
   *             success:
   *               type: boolean
   *               example: false
   *             message:
   *               type: string
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 500
   *             success:
   *               type: boolean
   *               example: false
   *             message:
   *               type: string
   */
  async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, password } = req.body;

      const isExistsEmail = await User.findOne({ email });

      if (isExistsEmail) {
        return createResponse(res, 400, false, 'Email is already in use');
      }

      const hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);

      const user = await new User({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      }).save();

      if(!user) {
        return createResponse(res, 400, false, 'Create user failed')
      }

      const username = `${firstname} ${lastname}`

      const verificationCode = crypto.randomBytes(3).toString('hex');

      cache.set(`${email}-verify-account`, verificationCode, 3 * 60 * 60)

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Email verification',
        template: 'verify-user',
        context: {
          verificationCode,
          username,
        }
      }  

      createResponse(res, 201, true, 'Created user successfully, please check your email to verify account');
      
      try {
        await transporter.sendMail(mailOptions);
        console.log('send mail success');
        
      } catch (error) {
        return createResponse(res, 500, false, 'Send mail failed, please try again!')
      }

    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: "Log in to your account"
   *     description: "Log in to your account using your email and password"
   *     parameters:
   *       - in: body
   *         name: user
   *         description: "The user to Login."
   *         schema:
   *           type: object
   *           required:
   *             - email
   *             - password
   *             - properties
   *           properties:
   *             email:
   *               type: string
   *               example: quangnkt1976@gmail.com
   *             password:
   *               type: string
   *               example: duyquanghaha
   *     responses:
   *       200:
   *         description: "Log in successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *             data:
   *               type: object
   *               description: JWT token for authentication
   *       400:
   *          description: "Log in account failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   */

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) {
        return createResponse(res, 400, false, 'Invalid email');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return createResponse(res, 400, false, 'Invalid password');
      }

      if (user.isVerify == false) {
        return createResponse(
          res,
          400,
          false,
          'Please verify your email address before logging in',
        );
      }

      const token = await signToken(res, user.id, user.email);
      return token;
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  async loginGoogle (req: Request | any, res: Response) {
    try {
      const user = req.user
      const firstname = user._json.given_name;
      const lastname = user._json.family_name;
      const avatar = user._json.picture
      const email = user._json.email
      const authGoogleId = user.id
      const isVerify = true
      
      const isExistsUser = await User.findOne({email})
  
      if (!isExistsUser) {
        const user = new User({firstname, lastname, avatar,email, authGoogleId, isVerify})
        
        await user.save()
      }

      const payload = user._json
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET,  { expiresIn: '7d' })
      return createResponse(res, 200, true, 'Login with google successfully', {accessToken} )
    } catch (error) {
      createResponse(res, 500, false, error.message)
    }
  }

  
  async loginFacebook (req: Request | any, res: Response) {
    const user = req.user

    return res.json({user})
  }

  /**
   * @swagger
   * /auth/verify-user-by-code:
   *   post:
   *     tags:
   *       - Auth
   *     summary: "Verify User"
   *     description: "Verify your account using code"
   *     parameters:
   *       - in: body
   *         name: verificationCode
   *         description: "The code to verify."
   *         schema:
   *           type: object
   *           required:
   *             - verificationCode
   *           properties:
   *             verificationCode:
   *               type: string
   *               example: 123234
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *           example: quangnkt1976@gmail.com
   *         description: "The email of the user to verify user"
   *     responses:
   *       201:
   *         description: "Verify user successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *       400:
   *          description: "Verify user failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   */

  async verifyUserByCode(req: Request | any, res: Response) {
    try {
      const verificationCode = req.body.verificationCode;
      const email: string = req.query.email;

      const user = await User.findOne({ email });

      if (!user) {
        return createResponse(res, 404, false, 'User not found');
      } 

      if (user.isVerify == true) {
        return createResponse(res,400, false, 'Your account have verified')
      }

      if (verificationCode == cache.get(`${email}-verify-account`)) {
        user.isVerify = true;
        await user.save();

        cache.del(`${email}-verify-account`)

        return createResponse(
          res,
          201,
          true,
          'Account verification successful',
        );
      } else {
        return createResponse(
          res,
          400,
          false,
          'The verification code you entered is invalid. Please check the code and try again',
        );
      }
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /auth/resend-verification-code:
   *   post:
   *     tags:
   *       - Auth
   *     summary: "resend email verify"
   *     description: "Verify your account/ request change password/ request change email using code"
   *     parameters:
   *       - in: body
   *         name: quangnkt1976@gmail.com
   *         description: "Email to send verification code."
   *         schema:
   *           type: object
   *           required:
   *             - codeType
   *             - email
   *           properties:
   *             email:
   *               type: string
   *               example: quangnkt1976@gmail.com
   *             codeType:
   *               type: string
   *               example: 123123
   *     responses:
   *       200:
   *         description: "Send mail successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 200
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *       400:
   *          description: "send email failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   */

  async resendVerificationCode(req: Request, res: Response) {
    try {
        const {email, typeCode} = req.body

        if(!typeCode) {
          return createResponse(res, 400, false, 'please enter your type verify code')
        }

        const user = await User.findOne({email})

        if(!user) {
          return createResponse(res, 400, false, 'User not found')
        }

        const username = `${user.firstname} ${user.lastname}`

        const verificationCode = crypto.randomBytes(3).toString('hex');

        
        const isExistsCode = cache.get(`${email}-${typeCode}`)
        
        if (isExistsCode) {
          return createResponse(res, 400, false, 'You have sent too many requests in a short period of time. Please wait a moment before trying again.')
        }
        
        cache.set(`${email}-${typeCode}`, verificationCode, 1 * 60 * 60 )

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Resend verification code',
          template: 'verify-user',
          context: {
            verificationCode,
            username,
          }
        }  

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        return createResponse(res, 500, false, 'Send mail failed, please try again!')
      }

    return createResponse(res, 200, true, 'Send mail successfully, please check your email to verify account');
    
  } catch (error) {
    return createResponse(res, 500, false, error.message)
  }
}

  /**
   * @swagger
   * /auth/reset-password:
   *   put:
   *     tags:
   *       - Auth
   *     summary: "Reset your password"
   *     description: "Reset your password"
   *     parameters:
   *       - in: body
   *         name: user
   *         description: "The user to update."
   *         schema:
   *           type: object
   *           required:
   *             - verificationCode
   *             - password
   *           properties:
   *             verificationCode:
   *               type: string
   *               example: 123123
   *             password:
   *               type: string
   *               example: duyquang
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *           example: quangnkt1976@gmail.com
   *         description: "The email of the user to change Password"
   *     responses:
   *       201:
   *         description: "Change password successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *             message:
   *               type: string
   *       400:
   *          description: "Change password failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 400
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *       500:
   *         description: "Server internal error "
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 500
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   */

  async resetPassword(req: Request | any, res: Response): Promise<object> {
    try {
      const { email } = req.query;
      const { password,  verificationCode} = req.body;
      if (!password || !verificationCode) {
        return createResponse(res, 400, false, 'invalid input');
      }

      const user = await User.findOne({ email });
      if (!user) {
        return createResponse(res, 400, false, 'User not found');
      }

      if (cache.get(`${email}-verify-password`) != verificationCode) {
        return createResponse(res, 400, false, 'The verification code you entered is invalid or has expired. Please check the code and try again ')
      }

      try {
        const hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);
        user.password = await hashedPassword;
        await user.save();
        cache.del(`${email}-verify-password`)
      } catch (error) {
        return createResponse(res, 400, false, error.message);
      }

      return createResponse(res, 201, true, 'Password update successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      if (!req.cookies && !req.cookies.jwt) {
        return createResponse(res, 401, false,'Unauthorized')
      }
      
      const refreshToken = req.cookies.jwt;

      const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET)
      
      if (!decodedToken) {
        return createResponse(res, 406, false, 'Unauthorized')
      }

      decodedToken

      return;



    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
}

// Create JWT
export async function signToken(
  res: Response,
  id: object | string,
  email: string,
): Promise<any> {
  const payload = { id, email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '20m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '4d'});

  res.cookie('jwt', refreshToken, { httpOnly: true, 
                                    sameSite: 'none' as const, secure: true,
                                    maxAge: 24 * 60 * 60 * 1000 })
  return createResponse(res, 200, true, 'Login successfully', {
    accessToken
  });
}
