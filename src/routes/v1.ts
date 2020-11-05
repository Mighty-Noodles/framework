import { Router } from 'express';
import { profileRoutes } from '@auth/routes/Profile.routes';
import { authRoutes } from '@auth/routes/Auth.routes';

const apiV1Routes = Router();

apiV1Routes.use('/profile', profileRoutes);
apiV1Routes.use('/', authRoutes);

export { apiV1Routes };
