import { Router } from 'express';
import { ProfileController } from '../controllers/Profile.controller';
import { AuthService } from '../routes/Passport';

const profileRoutes = Router();

profileRoutes.get('/', AuthService.passportJwt, ProfileController.index);
profileRoutes.put('/', AuthService.passportJwt, ProfileController.update);

export { profileRoutes }
