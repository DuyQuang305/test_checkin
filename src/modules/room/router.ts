import express from 'express';

// import Validation from '../../middlewares/Validation';
import { jwtGuard } from '../../middlewares/jwtGuard';
import RoomController from './controller';

const router = express.Router();

const roomController = new RoomController();

router.get('/', jwtGuard, roomController.showRoom);
router.get('/:roomId', jwtGuard, roomController.showRoomDetail);
router.post('/create', jwtGuard, roomController.createRoom);

router.post('/invite-member/:roomId', jwtGuard, roomController.inviteMember);
router.get('/accept-member', roomController.acceptMember);

export default router;
