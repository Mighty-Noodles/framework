import { Router } from 'express';
import { AuthController } from '../../controllers/Auth.controller';

const authRoutes = Router();

authRoutes.post('/signup', AuthController.signup);
authRoutes.post('/signin', AuthController.signin);

export { authRoutes };
