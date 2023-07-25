import express from 'express';

import StatisticController from './controller';

import { jwtGuard } from '../../middlewares/guard';
import roleGuard from '../../middlewares/roleGuard';

const router = express.Router();
const statisticController = new StatisticController();

router.get('/history', jwtGuard, statisticController.attendanceHistory)

router.get('/history-me', jwtGuard, statisticController.myAttendanceHistory);

router.get('/find-by-user/:userId', jwtGuard, statisticController.AttendanceHistoryPerson);

router.get(
  '/attendance-by-room/:roomId',
  jwtGuard,
  statisticController.attendanceByRoom,
);

router.get('/time-work-by-month', jwtGuard, statisticController.statiticTimeWorkByMonth)

export default router;
