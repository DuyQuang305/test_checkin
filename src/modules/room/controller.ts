import { Request, Response, NextFunction } from 'express';
import { Room } from '../../models/room';
import { User } from '../../models/user';
import { Time } from '../../models/time';

import sendEmail from '../../services/sendMail';
import getIpAddress from '../../services/IpAddress';

import createResponse from '../../common/function/createResponse';

import checkTime from '../../common/function/checkTime';

require('dotenv').config;

export default class Controller {
  /**
   * @swagger
   * /room/{roomId}:
   *   get:
   *     tags:
   *       - Room
   *     summary: "Get infomation room"
   *     description: "Get infomation room"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roomId
   *         description: "The roomId of the room to get infomation room"
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: Get infomation room successfully
   *             data:
   *               type: object
   *       400:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Get infomation room failed"
   *       401:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 400
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "Unauthorization"
   *       403:
   *          description: "Failed"
   *          schema:
   *            type: object
   *            properties:
   *              statusCode:
   *                type: number
   *                example: 403
   *              success:
   *                type: boolean
   *                example: false
   *              message:
   *                type: string
   *                example: "To view information about the room, the user must be either the owner of the room or a member of the room"
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
   *              example: "Server internal error"
   *             data:
   *              type: object
   */

  async showRoom(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const user = req.user.id
      
      const room = await Room.findById(roomId)
                              .populate('owner', 'firstname lastname')
                              .populate('members', 'firstname lastname')
      
      const isMember = room.members.some(member => {
        return member._id = user
      })
      
      if (!isMember || (room.owner._id != user) ) {
        return createResponse(res, 403, false, 'To view information about the room, the user must be either the owner of the room or a member of the room.')
      }

      return createResponse(
        res,
        200,
        true,
        'Get room by id successfully',
        room,
      );
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

/**
   * @swagger
   * /room/create:
   *   post:
   *     tags:
   *       - Room
   *     summary: "Create a new Room"
   *     description: "Create new room"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: room
   *         description: "The room to create."
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             time:
   *               type: array
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: "Create room successfully"
   *             data: 
   *               type: array
   *       400:
   *          description: "Failed"
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
   *               example: "invalid time"
   *       401:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 401
   *             success:
   *               type: boolean
   *               example: false
   *             message:
   *               type: string
   *               example: "Unauthorization"
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
   *               example: "Server internal error "
   */
  async createRoom(
    req: Request | any,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const ipAddress = await getIpAddress();
      const { name, time } = req.body;

      const errorMessages = await checkTime(time);
      if (errorMessages.length > 0) {
        return createResponse(res, 400, false, errorMessages[0]);
      }

      const room = new Room({
        name,
        allowed_ip: ipAddress,
        owner: req.user.id,
      });

      const timeWithRoomIds = time.map((t) => ({ ...t, room: room._id }));

      await Time.insertMany([...timeWithRoomIds]);

      await room.save();
      if (!room) {
        return createResponse(res, 400, false, 'Create room failed');
      }
      return createResponse(res, 201, true, 'Create room successfully', room);
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }

/**
   * @swagger
   * /room/inviteMember/{roomId}:
   *   post:
   *     tags:
   *       - Room
   *     summary: "Invite member to room Room"
   *     description: "Invite member to room Room by send Email"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: room
   *         description: "Invite member"
   *         schema:
   *           type: object
   *           properties:
   *             emails:
   *               type: array
   *           example: ["abc@gmail.com", "bce@gmail.com"]
   *       - in: path
   *         name: roomId
   *         description: "The room to which the member joins to check in."   
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: "Send Email successfully"
   *             data: 
   *               type: array
   *       400:
   *          description: "Failed"
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
   *               example: "invalid email"
   *       401:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 401
   *             success:
   *               type: boolean
   *               example: false
   *             message:
   *               type: string
   *               example: "Unauthorization"
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
   *               example: "Server internal error "
   */

  //  gửi email cho người dùng
  async inviteMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params
      const { emails } = req.body;
      const user = req.user.id
      const room = await Room.findById(roomId)
       
      const isMember = room.members.some((id) => {
        return id = user
      })

      if (!isMember || (room.owner ! = user) ) {
        return createResponse(res, 403, false, 'Only the room owner or members in the room have the right to invite others into the room')
      }

      emails.forEach((email) => {
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Invite to join checkin',
          text: `You have been invited to join a room for check-in. Please click on the following link to access the room: ${process.env.URL_SERVER}/room/${roomId}`,
        };

        sendEmail(mailOptions);
      });

      return createResponse(res, 201, true, 'Invite members successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
/**
   * @swagger
   * /room/addMember/{roomId}:
   *   put:
   *     tags:
   *       - Room
   *     summary: "Add member to room Room"
   *     description: "Add member to room when user enter email"
   *     security: 
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: email
   *         description: "email to add member"
   *         schema:
   *           type: object
   *           properties:
   *             email:
   *               type: string
   *               example: "bce@gmail.com"
   *       - in: path
   *         name: roomId
   *         description: "add member to room"    
   *     responses:
   *       201:
   *         description: "Successfully"
   *         schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 201
   *             success:
   *               type: boolean
   *               example: true
   *             message:
   *               type: string
   *               example: "Add member to room successfully"
   *       400:
   *          description: "Failed"
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
   *               example: "invalid email"
   *       401:
   *          description: "Failed"
   *          schema:
   *           type: object
   *           properties:
   *             statusCode:
   *               type: number
   *               example: 401
   *             success:
   *               type: boolean
   *               example: false
   *             message:
   *               type: string
   *               example: "Unauthorization"
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
   *               example: "Server internal error "
   */

  //  mời người dùng bằng cách nhập mail
  async addMember(req: Request | any, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { email } = req.body;

      const userExists = await User.findOne({ email: email });

      if (!userExists) {
        return createResponse(res, 400, false, 'Invalid email');
      }

      const roomExists = await Room.findById(roomId);

      if (!roomExists) {
        return createResponse(res, 400, false, 'Room not found');
      } else if (roomExists.members.includes(userExists._id)) {
        return createResponse(
          res,
          400,
          false,
          'This member has already joined the room before',
        );
      }

      const updateRoom = await Room.updateOne(
        { _id: roomId },
        { $push: { members: userExists._id } },
      );

      if (!updateRoom) {
        return createResponse(res, 400, false, 'Failed to update room time');
      }

      return createResponse(res, 201, true, 'Add members successfully');
    } catch (error) {
      return createResponse(res, 500, false, error.message);
    }
  }
}

