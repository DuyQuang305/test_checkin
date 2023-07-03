import express from 'express';

// import Validation from '../../middlewares/Validation';
import { jwtGuard } from '../../middlewares/jwtGuard';
import RoomController from './controller';

const router = express.Router();

const roomController = new RoomController();

router.post('/create', jwtGuard, roomController.createRoom);

// Send mail inviteMember
router.put('/inviteMember', jwtGuard, roomController.inviteMember);
// Add member to room after member confirms joining
router.put('/addMember/:roomId', jwtGuard, roomController.addMember);

router.put('/addTime/:roomId', roomController.addTime);
router.put('/changeTime/:roomId/:timeId', roomController.changeTime);
router.delete('/changeTime/:roomId/:timeId', roomController.deleteTime);

export default router;
