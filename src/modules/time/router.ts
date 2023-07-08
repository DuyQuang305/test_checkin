import express from 'express';
import TimeController from './controller';
import { jwtGuard } from '../../middlewares/jwtGuard';

const router = express.Router();

const timeController = new TimeController();

router.put('/:timeId', jwtGuard, timeController.changeTime);

export default router;
