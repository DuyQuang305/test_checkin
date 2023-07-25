import express from 'express';

import AuthController from './controller';
import SchemaValidation from './validations';

import { googleGuardSuccess, googleGuardFailed, facebookGuardSuccess, facebookGuardFailed } from '../../middlewares/guard';
import Validation from '../../middlewares/validation';

const router = express.Router();
const authController = new AuthController();
const schemaValidation = new SchemaValidation();

router.post('/register', Validation(schemaValidation.Register), authController.register);

router.post('/login', Validation(schemaValidation.Login), authController.login);
router.get('/google', googleGuardSuccess)
router.get('/facebook', facebookGuardSuccess)
router.get('/google/callback', googleGuardFailed, authController.loginGoogle)
router.get('/facebook/callback', facebookGuardFailed, authController.loginFacebook)

router.post('/refresh', authController.refreshToken);
router.post('/verify-user-by-code', authController.verifyUserByCode);
// api này dùng chung khi mà người dùng yêu cầu gửi lại mã xác minh khi đăng kí và yêu cầu đổi lại mật khẩu
router.post('/resend-verification-code', authController.resendVerificationCode)

router.put('/reset-password', authController.resetPassword);

export default router;
