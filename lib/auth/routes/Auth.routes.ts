import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller';

const authRoutes = Router();

authRoutes.post('/signup', AuthController.signup);
authRoutes.get('/signup/:id/confirm', AuthController.confirmSignup);
authRoutes.put('/signup/:id/confirm', AuthController.confirmSignup);

authRoutes.post('/signup/early_access', AuthController.earlyAccessSignup);
authRoutes.put('/signup/early_access/:id/confirm', AuthController.earlyAccessConfirmSignup);

authRoutes.post('/login', AuthController.login);

authRoutes.post('/password/forgot', AuthController.request_reset_password);
authRoutes.put('/password/:id/reset', AuthController.reset_password);

export { authRoutes };
