import express from 'express';

import AuthController from './controller';
import LoginSchema from './validations/login';
import registerSchema from './validations/register';

import Validation from '../../middlewares/validation';

const router = express.Router();
const authController = new AuthController();

router.post('/register', Validation(registerSchema), authController.register);
router.post('/login', Validation(LoginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-user-request', authController.verifyUserRequest);
router.get('/verify-user-by-code', authController.verifyUserByCode);
router.put('/reset-password', authController.resetPassword);

export default router;
