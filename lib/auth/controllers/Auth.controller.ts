import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { AuthRequest } from '../routes/Passport';
import { User } from '../models/User';
import { PasswordService } from '../services/Password.service';
import { SignupService } from '../services/Signup.service';
import { SignupConfirmationService } from '../services/SignupConfirmation.service';
import { EarlyAccessSignupService } from '../services/EarlyAccessSignup.service';
import { controllerCatchFn } from '../../libUtils/logger';

import AppConfig from '../../../app.config.json';
import { PreLaunchSignupService } from '../services/PreLaunchSignup.service';

export const AuthController = {
  signup: async (req: AuthRequest, res: Response): Promise<void> => {
    return SignupService.signup(req.body)
      .then((user: User) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch(controllerCatchFn('Error on signup', req, res));
  },

  confirmSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    const token = req.query?.token as string || req.body?.token;

    return SignupConfirmationService.verify(token || req.body.token, req.params.id)
      .then(user => SignupService.confirmSignup(user))
      .then((user) => {
        if (req.accepts(['json', 'html']) === 'html') {
          res.redirect(AppConfig.auth.signup.signupConfirmationRedirectUrl)
        } else {
          res.status(200).json({
            item: user.toJson(),
          });
        }
      })
      .catch(controllerCatchFn('Error on signup confirmation', req, res));
  },

  login: (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      'login',
      async (err, user: User) => {
        try {
          if (err) {
            console.error(err);
            return next(new Error('An error occurred.'));
          }

          if (!user) {
            return res.status(401).json({ code: 401, message: 'Email or password is invalid' });
          }

          if (!user.confirmed) {
            return res.status(403).json({ code: 401, message: 'Email not confirmed' });
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);

              const tokenParams = { id: user.id, email: user.email };
              const token = jwt.sign(tokenParams, process.env.JWT_SECRET);

              return res.status(200).json({ item: user.toJson(), token });
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  },

  request_reset_password: async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    return PasswordService.sendPasswordResetEmail({ email })
      .then(() => {
        res.status(200).json({ message: 'An email with a password reset link was sent to your inbox' });
      })
      .catch(controllerCatchFn('Error on reset password request', req, res));
  },

  reset_password: async (req: Request, res: Response): Promise<void> => {
    return PasswordService.verify(req.body.token, req.params.id)
      .then(user => PasswordService.reset({
        user,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
      }))
      .then((user) => {
        res.status(200).json({ item: user.toJson() });
      })
      .catch(controllerCatchFn('Error on reset password', req, res));
  },

  preLaunchSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return PreLaunchSignupService.signup(req.body)
      .then((user: User) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch(controllerCatchFn('Error on pre-launch signup', req, res));
  },

  earlyAccessSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return EarlyAccessSignupService.signup(req.body)
      .then((user: User) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch(controllerCatchFn('Error on early access signup', req, res));
  },

  earlyAccessConfirmSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return SignupConfirmationService.verify(req.body.token as string, req.params.id)
      .then(user => EarlyAccessSignupService.confirmSignup({
        user,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
      }))
      .then((user) => {
        const tokenParams = { id: user.id, email: user.email };
        const token = jwt.sign(tokenParams, process.env.JWT_SECRET);

        res.status(200).json({
          item: user.toJson(),
          token,
        });
      })
      .catch(controllerCatchFn('Error on early access signup confirmation', req, res));
  },
};

