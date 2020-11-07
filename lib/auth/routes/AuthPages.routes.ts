import { Request, Response, Router } from 'express';

const authPages = Router();

const WithCredential = (req: Request) => ({ id: req.params.id, token: req.query.token });

const AuthPagesController = {
  login:                          (req: Request, res: Response): void => res.render('login'),
  passwordForgot:                 (req: Request, res: Response): void => res.render('passwordForgot'),
  passwordReset:                  (req: Request, res: Response): void => res.render('passwordReset', WithCredential(req)),
  earlyAccessSignup:              (req: Request, res: Response): void => res.render('signupEarlyAccess'),
  earlyAccessSignupConfirmation:  (req: Request, res: Response): void => res.render('signupEarlyAccessConfirmation', WithCredential(req)),
  signup:                         (req: Request, res: Response): void => res.render('signup'),
};

authPages.get('/login',                           AuthPagesController.login);
authPages.get('/password/forgot',                 AuthPagesController.passwordForgot);
authPages.get('/password/:id/reset',              AuthPagesController.passwordReset);
authPages.get('/signup/early_access',             AuthPagesController.earlyAccessSignup);
authPages.get('/signup/early_access/:id/confirm', AuthPagesController.earlyAccessSignupConfirmation);
authPages.get('/signup',                          AuthPagesController.signup);

const authViewPath = './lib/auth/views';
const authPublic = 'lib/auth/public';

export { authPages, authViewPath, authPublic, AuthPagesController };
