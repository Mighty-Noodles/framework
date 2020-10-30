import { Router } from 'express';
import { testRoutes } from './v1/Test.routes';

const apiV1Routes = Router();

apiV1Routes.use('/test', testRoutes);

export { apiV1Routes };
