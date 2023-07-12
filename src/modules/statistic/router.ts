import express from 'express';

import StatisticController from './controller';

import { jwtGuard } from '../../middlewares/jwtGuard';
import roleGuard from '../../middlewares/roleGuard';

const router = express.Router();
const statisticController = new StatisticController();

// Xem lịch sử điểm danh từ trước đến nay
router.get('/history/me', jwtGuard, statisticController.myAttendanceHistory);

router.get('/find-by-user/:id', jwtGuard, statisticController.AttendanceHistoryPerson);

// Xem lịch sử điểm danh theo phòng
// router.get(
//   '/attendanceByRoom/:room',
//   jwtGuard,
//   statisticController.attendanceByRoom,
// );

// // Xem lịch sử điểm danh theo ngày trong tuần
// // router.get(
// //   '/attendanceByDay',
// //   jwtGuard,
// //   statisticController.attendanceByDay,
// // );



export default router;
