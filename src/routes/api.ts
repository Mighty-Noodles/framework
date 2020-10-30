import { Router } from 'express';
import { apiV1Routes } from './v1';

const apiRoutes = Router();

apiRoutes.use('/v1', apiV1Routes);

export { apiRoutes };
