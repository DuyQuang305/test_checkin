import express from 'express';

import StatisticController from './controller';

import { jwtGuard } from '../../middlewares/jwtGuard';
import roleGuard from '../../middlewares/roleGuard';

const router = express.Router();
const statisticController = new StatisticController();

// Xem lịch sử điểm danh từ trước đến nay
router.get('/checkinHistory', jwtGuard, statisticController.attendanceHistory);

// Xem lịch sử điểm danh theo phòng
router.get('/attendanceByRoom/:room', jwtGuard, statisticController.attendanceByRoom);

// Xem lịch sử điểm danh theo ngày trong tuần
router.get('/AttendanceByDayOfWeek', jwtGuard, statisticController.attendanceByDayOfWeek);

router.get('/lateArrivals', jwtGuard, statisticController.lateArrivals);

router.get('/leaveEarly', jwtGuard, statisticController.leaveEarly);


router.get('/lateArrivalsByUser', jwtGuard, statisticController.lateArrivals);

router.get('/leaveEarlyByUser', jwtGuard, statisticController.leaveEarly);






export default router;
