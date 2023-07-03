import express from 'express';

import AttendanceController from './controller';

import { jwtGuard } from '../../middlewares/jwtGuard';

const attendanceController = new AttendanceController();

const router = express.Router();

router.post('/checkin/:roomId', jwtGuard, attendanceController.checkin);
router.post('/checkout', jwtGuard, attendanceController.checkout);

export default router;
