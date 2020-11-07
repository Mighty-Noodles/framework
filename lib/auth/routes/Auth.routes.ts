import { Router } from 'express';
import { AuthController } from '@auth/controllers/Auth.controller';

const authRoutes = Router();

authRoutes.post('/signup', AuthController.signup);
authRoutes.get('/signup/:id/confirm', AuthController.confirmSignup);

authRoutes.post('/signup/early_access', AuthController.earlyAccessSignup);
authRoutes.put('/signup/early_access/:id/confirm', AuthController.earlyAccessConfirmSignup);

authRoutes.post('/signin', AuthController.signin);

authRoutes.post('/password/forgot', AuthController.request_reset_password);
authRoutes.put('/password/:id/reset', AuthController.reset_password);

export { authRoutes };
