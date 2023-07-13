import express from 'express';

import StatisticController from './controller';

import { jwtGuard } from '../../middlewares/jwtGuard';
import roleGuard from '../../middlewares/roleGuard';

const router = express.Router();
const statisticController = new StatisticController();

router.get('/history', jwtGuard, statisticController.attendanceHistory)

router.get('/history-me', jwtGuard, statisticController.myAttendanceHistory);

router.get('/find-by-user/:userId', jwtGuard, statisticController.AttendanceHistoryPerson);

router.get(
  '/attendanceByRoom/:roomId',
  jwtGuard,
  statisticController.attendanceByRoom,
);

export default router;
