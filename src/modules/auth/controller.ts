import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import Token from '../../common/interface/token';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { User } from '../../models/user';

import createResponse from '../../common/function/createResponse';

import cache from '../../services/cache';
import sendMail from '../../services/sendMail';

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
   *         name: user
   *         description: "The user to create."
   *         schema:
   *           type: object
   *           required:
   *             - email
   *             - properties
   *           properties:
   *             email:
   *               type: string
   *             firstname:
   *               type: string
   *             lastname:
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

      return createResponse(res, 201, true, 'Created user successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
  /**
   * @swagger
   * /auth/sendVerificationCode:
   *   post:
   *     tags:
   *       - Auth
   *     summary: "Send email"
   *     description: "Send email to user"
   *     parameters:
   *       - in: body
   *         name: email
   *         description: "The email to send."
   *         schema:
   *           type: object
   *           required:
   *             - email
   *             - properties
   *           properties:
   *             email:
   *               type: string
   *     responses:
   *       200:
   *         description: "Send email successfully"
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
   *          description: "Send email failed"
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
  async sendConfirmationMessage(req: Request, res: Response) {
    try {
      const { email } = req.body;

      let username: String = undefined;

      const user = await User.findOne({ email });

      if (!user) {
        return createResponse(res, 404, false, 'User not found');
      }

      username = `${user.firstname} ${user.lastname}`;

      const verificationCode = crypto.randomBytes(3).toString('hex');

      cache.set(email, verificationCode, 60 * 5 * 1000);

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Email verification',
        html: `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
                      <tbody>
                        <tr>
                          <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperWebview" style="max-width:600px">
                              <tbody>
                                <tr>
                                  <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tbody>
                                        <tr>
                                           <td style="padding-top: 20px; padding-bottom: 20px; padding-right: 0px;" align="right" valign="middle" class="webview"> <a href="#" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:right;text-decoration:underline;padding:0;margin:0" target="_blank" class="text hideOnMobile">Oh wait, there's more! →</a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                              <tbody>
                                <tr>
                                  <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                      <tbody>
                                        <tr>
                                          <td style="background-color:#00d2f4;font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                                        </tr>
                                        <tr>
                                          <td style="padding-top: 60px; padding-bottom: 20px;" align="center" valign="middle" class="emailLogo">
                                            <a href="#" style="text-decoration:none" target="_blank">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/logo.png" style="width:100%;max-width:150px;height:auto;display:block" width="150">
                                            </a>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding-bottom: 20px;" align="center" valign="top" class="imgHero">
                                            <a href="#" style="text-decoration:none" target="_blank">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/heroGradient/user-account.png" style="width:100%;max-width:600px;height:auto;display:block;color: #f9f9f9;" width="600">
                                            </a>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                                            <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">${username}</h2>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                                            <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">Verify Your Email Account</h4>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                              <tbody>
                                                <tr>
                                                  <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                                    <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Your authentication code is.</p>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
                                              <tbody>
                                                <tr>
                                                  <td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                      <tbody>
                                                        <tr>
                                                          <td style="background-color: rgb(0, 210, 244); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href="#" style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-decoration:none;display:block" target="_blank" class="text">${verificationCode}</a>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                        </tr>
                                        <tr>
                                          <td align="center" valign="middle" style="padding-bottom: 40px;" class="emailRegards">
                                            <!-- Image and Link // -->
                                            <a href="#" target="_blank" style="text-decoration:none;">
                                              <img mc:edit="signature" src="http://email.aumfusion.com/vespro/img//other/signature.png" alt="" width="150" border="0" style="width:100%;
                        max-width:150px; height:auto; display:block;">
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                      <tbody>
                                        <tr>
                                          <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                              <tbody>
                                <tr>
                                  <td align="center" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
                                            <a href="#facebook-link" style="display:inline-block" target="_blank" class="facebook">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                            </a>
                                            <a href="#twitter-link" style="display: inline-block;" target="_blank" class="twitter">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/twitter.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                            </a>
                                            <a href="#pintrest-link" style="display: inline-block;" target="_blank" class="pintrest">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/pintrest.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                            </a>
                                            <a href="#instagram-link" style="display: inline-block;" target="_blank" class="instagram">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                            </a>
                                            <a href="#linkdin-link" style="display: inline-block;" target="_blank" class="linkdin">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/linkdin.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                            </a>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                                            <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Vespro Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
                                            <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
                                            </p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                                            <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
                                              <br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="appLinks">
                                            <a href="#Play-Store-Link" style="display: inline-block;" target="_blank" class="play-store">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/play-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                            </a>
                                            <a href="#App-Store-Link" style="display: inline-block;" target="_blank" class="app-store">
                                              <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/app-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                            </a>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>`,
      };

      sendMail(mailOptions);

      return createResponse(res, 200, true, 'Sent message successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

  /**
   * @swagger
   * /auth/verifyUser/{email}:
   *   get:
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
   *       - in: path
   *         name: email
   *         description: "The email of the user to verify user"
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: "Verify user successfully"
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

  async verifyUser(req: Request, res: Response) {
    try {
      const verificationCode = req.body.verificationCode;
      const email = req.params.email;
      const user = await User.findOne({ email });

      if (!user) {
        return createResponse(res, 404, false, 'User not found');
      } else {
        if (verificationCode == cache.get(email)) {
          user.isVerify = true;
          await user.save();

          cache.del(email);

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
            'The verification code you entered is invalid or has expired. Please check the code and try again',
          );
        }
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
   *             password:
   *               type: string
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
   *             token:
   *               type: string
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

  /**
   * @swagger
   * /auth/resetPassword/{email}:
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
   *             - password
   *           properties:
   *             password:
   *               type: string
   *       - in: path
   *         name: email
   *         description: "The email of the user to change Password"
   *         schema:
   *           type: string
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

  async resetPassword(req: Request, res: Response): Promise<object> {
    try {
      const { email } = req.params;
      const { password } = req.body;

      if (!password) {
        return createResponse(res, 400, false, 'Please enter your password');
      }

      const user = await User.findOne({ email });

      if (!user) {
        return createResponse(res, 400, false, 'User not found');
      }

      try {
        const hashedPassword = await bcrypt.hash(password, SECRET_ROUNDS);
        user.password = await hashedPassword;
        await user.save();
      } catch (error) {
        return createResponse(res, 400, false, error.message);
      }

      return createResponse(res, 201, true, 'Password update successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
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
      return createResponse(res, 500, false, error.message);
    }
  }
}

// Create JWT
export async function signToken(
  res: Response,
  id: object,
  email: string,
  refreshToken?: string,
): Promise<Token | object | void> {
  const payload = { id, email };

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  const refresh_token = jwt.sign(payload, process.env.JWT_SECRET);

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
      return createResponse(res, 400, false, 'Invalid Token');
    }
  } else {
    await User.updateOne(
      { _id: id },
      {
        token: refresh_token,
      },
    );
  }
  return createResponse(res, 200, true, 'Login successfully', {
    access_token,
    refresh_token,
  });
}
