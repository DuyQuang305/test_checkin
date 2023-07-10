import express from 'express';

import AuthController from './controller';
import LoginSchema from './validations/login';
import registerSchema from './validations/register';

import Validation from '../../middlewares/Validation';

const router = express.Router();
const authController = new AuthController();

router.post('/register', Validation(registerSchema), authController.register);
router.post('/login', Validation(LoginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/sendVerificationCode', authController.sendConfirmationMessage);
router.get('/verifyUser/:email', authController.verifyUser);
router.put('/resetPassword/:email', authController.resetPassword);

export default router;
