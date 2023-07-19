import express from 'express';

import ProfileController from './controller';
import userSchema from './validations/user';

import Validation from '../../middlewares/validation';
import { jwtGuard } from '../../middlewares/jwtGuard';
const upload = require('../../middlewares/upload');

const router = express.Router();
const profileController = new ProfileController();

router.get('/', jwtGuard, profileController.profile);

router.patch(
  '/',
  jwtGuard,
  Validation(userSchema),
  upload.single('avatar'),
  profileController.editProfile,
);

router.post('/send-verification-change-email', jwtGuard, profileController.sendMessage)

router.patch('/email', jwtGuard, profileController.editEmail,
);
router.delete('/', jwtGuard, profileController.delete);

export default router;
