import express from 'express';

// import Validation from '../../middlewares/Validation';
import { jwtGuard } from '../../middlewares/jwtGuard';
import RoomController from './controller';

const router = express.Router();

const roomController = new RoomController();

router.get('/:roomId', jwtGuard, roomController.showRoom);
router.post('/create', jwtGuard, roomController.createRoom);

router.put('/inviteMember', jwtGuard, roomController.inviteMember);
router.put('/addMember/:roomId', roomController.addMember);

export default router;
