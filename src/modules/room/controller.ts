import { Request, Response, NextFunction } from 'express';
import {Room} from '../../models/room';

class controller {
  async createRoom(req: Request, res: Response, next:NextFunction) {
    return res.json(req.user);
  }
}

export default new controller ()