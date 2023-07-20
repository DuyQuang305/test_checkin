import { NextFunction, Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { User } from '../../models';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { Message } from '../../common/constant/message';

import createResponse from '../../common/function/createResponse';

import cache from '../../services/cache';

import removeExistsFile from '../../middlewares/removeExistsFile';

const transporter = require('../../services/nodeMailer');


export default class ProfileController {
  /**
   * @swagger
   * /profile:
   *   get:
   *     tags:
   *       - Profile
   *     summary: "Get infomation User"
   *     description: "Get infomation User"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: "Get infomation successfully"
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
   *       400:
   *          description: "Get infomation failed"
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
   *       401:
   *          description: "Get infomation failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 401
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *              example: "Unauthorization"
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
  async profile(req: Request | any, res: Response): Promise<any> {
    try {
      const userId = req.user.id

      const user = await User.findById(userId).select(['firstname', 'lastname', 'email'])
      return createResponse(
        res,
        200,
        true,
        'Get profile successfully',
        user,
      );
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /profile:
   *   patch:
   *     tags:
   *       - Profile
   *     summary: "Edit profile"
   *     description: "Edit profile"
   *     consumes:
   *       - multipart/form-data
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: formData
   *         name: firstname
   *         description: "First name of the user"
   *         type: string
   *       - in: formData
   *         name: lastname
   *         description: "Last name of the user"
   *         type: string
   *       - in: formData
   *         name: password
   *         description: "Password of the user"
   *         type: string
   *       - in: formData
   *         name: avatar
   *         description: "Avatar of the user"
   *         type: file
   *     responses:
   *       201:
   *         description: "Edit profile successfully"
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
   *             data:
   *               type: object
   *       400:
   *          description: "Edit profile failed"
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
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 401
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
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
        if (user.avatar) {
          removeExistsFile(user.avatar);
        }
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

      return createResponse(
        res,
        201,
        true,
        Message.ProfileUpdated,
        updatedUser,
      );
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /profile/send-verification-change-email:
   *   post:
   *     tags:
   *       - Profile
   *     summary: "send email verify"
   *     description: "Verify your request change email using code"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *     - in: body
   *       name: requestBody
   *       description: The request body for accepting a member.
   *       required: true
   *       schema:
   *         type: object
   *         required:
   *           - codeType
   *           - email
   *         properties:
   *           email:
   *             type: string
   *             example: quangnkt1976@gmail.com
   *           codeType:
   *             type: string
   *             example: 123123
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

  async sendMessage(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const {email, codeType} = req.body

      if(!codeType) {
        return createResponse(res, 400, false, 'please enter your type verify code')
      }

      const user = await User.findOne({email})

      if(!user) {
        return createResponse(res, 400, false, 'User not found')
      }

      const username = `${user.firstname} ${user.lastname}`

      const verificationCode = crypto.randomBytes(3).toString('hex');
      
      const isExistsCode = cache.get(`${email}-${codeType}`)
      
      if (isExistsCode) {
        return createResponse(res, 400, false, 'You have sent too many requests in a short period of time. Please wait a moment before trying again.')
      }
      
      cache.set(`${email}-${codeType}`, verificationCode, 1 * 60 * 60 )

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Send verification code',
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
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /profile/email:
   *   patch:
   *     tags:
   *       - Profile
   *     summary: "Change Email"
   *     description: "Change User's email"
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: email
   *         description: email to update
   *         schema:
   *           type: object
   *           require:
   *             - email
   *             - verificationCode
   *           propertise:
   *             - email:
   *                 type: string
   *                 description: New user's email address
   *             - verificationCode:
   *                 type: string
   *                 description: Code to verify user
   *           example:
   *             email: abc@gmail.com
   *             verificationCode: ABC123
   *     responses:
   *       201:
   *         description: "Edit email successfully"
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
   *             data:
   *               type: object
   *       400:
   *          description: "Edit email failed"
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
   *       401:
   *          description: "Edit email failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *              type: number
   *              example: 401
   *             success:
   *              type: boolean
   *              example: false
   *             message:
   *              type: string
   *              example: "Unauthorization"
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
   *             data:
   *              type: object
   */
  async editEmail(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { verificationCode, email} = req.body;

      const user = await User.findById(req.user.id);

      const code = cache.get(`${user.email}-verify-change-email`);

      if (verificationCode == code) {
        await User.findByIdAndUpdate(
          { _id: req.user.id },
          {
            email,
          },
        );
        cache.del(`${email}-verify-change-email`);

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
