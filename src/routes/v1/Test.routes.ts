import { Router } from 'express';
import { TestController } from '../../controllers/Test.controller';

const testRoutes = Router();

testRoutes.get('/:id', TestController.show);
testRoutes.get('/', TestController.index);

export { testRoutes }
