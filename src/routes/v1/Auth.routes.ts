import { Router } from 'express';
import { AuthController } from '../../controllers/Auth.controller';

const authRoutes = Router();

authRoutes.post('/signup', AuthController.signup);
authRoutes.put('/signup/:id/confirm', AuthController.confirmSignup);
authRoutes.post('/signin', AuthController.signin);
authRoutes.post('/password/forgot', AuthController.request_reset_password);
authRoutes.put('/password/:id/reset', AuthController.reset_password);

export { authRoutes };
