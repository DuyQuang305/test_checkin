import express from 'express';
import TimeController from './controller';
import { jwtGuard } from '../../middlewares/guard';

const router = express.Router();

const timeController = new TimeController();

router.get('/show/:roomId', jwtGuard, timeController.showTimeByRoom);
router.post('/add-time/:roomId', jwtGuard, timeController.addTime);
router.patch('/:timeId', jwtGuard, timeController.changeTime);

export default router;
