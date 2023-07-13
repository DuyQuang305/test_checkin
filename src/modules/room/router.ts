import express from 'express';

// import Validation from '../../middlewares/Validation';
import { jwtGuard } from '../../middlewares/jwtGuard';
import RoomController from './controller';

const router = express.Router();

const roomController = new RoomController();

router.get('/', jwtGuard, roomController.showRoom);
router.get('/:roomId', jwtGuard, roomController.showRoomDetail);
router.post('/create', jwtGuard, roomController.createRoom);

router.post('/inviteMember/:roomId', jwtGuard, roomController.inviteMember);
router.put('/addMember/:roomId', roomController.addMember);

export default router;
