import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import nodeCache from 'node-cache'
import crypto from 'crypto'

import Token from '../../common/interface/token';
import { SECRET_ROUNDS } from '../../common/constant/secret';
import { User } from '../../models/user';
const cache = new nodeCache()

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

      return res.status(201).json({msg:'created user successfully'})

    } catch (error) {
      return res.status(500).json({ message: 'Dulicate Email!' });
    }
  }

  async sendConfirmationMessage(req: Request, res: Response) {
      try {
        const {email} = req.body;

        let username: String = undefined

        const user = await User.findOne({email})

        if (!user) {
          return res.status(404).json({msg: 'User not found'})
        }

        username = `${user.firstname} ${user.lastname}`

        const verificationCode = crypto.randomBytes(3).toString('hex')

        cache.set(email, verificationCode, 60 * 5 * 1000)

        console.log(verificationCode);
        console.log( cache.get(email));
        

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });
  
  
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Email verification",
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
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log("Error in sending email  " + error);
          } else {
              console.log("Email sent" + info.response);
          }
      });

      } catch (error) {
        console.error(error);
      }
    }
  
    async verifyUser(req:Request, res:Response) {
      try {
          const verificationCode = req.body.verificationCode; 
          const email = req.params.email
          const user = await User.findOne({ email });
        console.log(cache.get(email));
        
          if(!user) {
            return res.status(404).json({msg: 'User not found '})
          } else {
            if (verificationCode == cache.get(email)) {
              user.isVerify = true;
              await user.save()

              cache.del(email);
               
              return res.status(201).json({msg: 'Account verification successful'})
            } else {
              return res.status(400).json({ 
                error: 'Invalid verification code', 
                details: 'The verification code you entered is invalid or has expired. Please check the code and try again.' 
              });
            }
          }
      

      } catch (error) {
          return res.status(500).json({msg: 'Internal Server Error'})
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

      if (user.isVerify == false) {
        return res.status(400).json({  message: "Please verify your email address before logging in" });
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
      return res.status(500).json({msg: 'Server internal error'});
      
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

  return res.json({ access_token, refresh_token });
}
