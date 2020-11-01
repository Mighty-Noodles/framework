import { Router } from 'express';
import { profileRoutes } from './v1/Profile.routes';
import { authRoutes } from './v1/Auth.routes';

const apiV1Routes = Router();

apiV1Routes.use('/profile', profileRoutes);
apiV1Routes.use('/', authRoutes);

export { apiV1Routes };
