import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { AuthRequest } from '@auth/routes/Passport';
import { User } from '@auth/models/User';
import { PasswordService } from '@auth/services/Password.service';
import { SignupService } from '@auth/services/Signup.service';
import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { EarlyAccessSignupService } from '@auth/services/EarlyAccessSignup.service';

export const AuthController = {
  signup: async (req: AuthRequest, res: Response): Promise<void> => {
    return SignupService.signup(req.body)
      .then((user: User) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending confirmation email', err);
        }
        res.status(err.code || 500).json(err.code ? err : { message: err.message });
      });
  },

  confirmSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return SignupConfirmationService.verify(req.query.token as string, req.params.id)
      .then(user => SignupService.confirmSignup(user))
      .then((user) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error confirming subscription', error);
        }
        res.status(error?.code || 500).json({ code: error?.code || 500, message: error?.message });
      });
  },

  signin: (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      'login',
      async (err, user: User) => {
        try {
          if (err) {
            console.error(err);
            return next(new Error('An error occurred.'));
          }

          if (!user) {
            return res.status(401).end();
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
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error requesting reset password', err);
        }

        res.status(500).json({ message: err?.message || 'Error requesting reset password' });
      });
  },

  reset_password: async (req: Request, res: Response): Promise<void> => {
    return PasswordService.verify(req.query.token as string, req.params.id)
      .then(user => PasswordService.reset({
        user,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
      }))
      .then((user) => {
        res.status(200).json({ item: user.toJson() });
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error request reset password', err);
        }

        res.status(err.code || 500).json({ code: err.code, message: err.message || 'Error request reset password' });
      });
  },

  earlyAccessSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return EarlyAccessSignupService.signup(req.body)
      .then((user: User) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending confirmation email', err);
        }
        res.status(err.code || 500).json(err.code ? err : { message: err.message });
      });
  },

  earlyAccessConfirmSignup: async (req: AuthRequest, res: Response): Promise<void> => {
    return SignupConfirmationService.verify(req.query.token as string, req.params.id)
      .then(user => EarlyAccessSignupService.confirmSignup({
        user,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
      }))
      .then((user) => {
        res.status(200).json({
          item: user.toJson(),
        });
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error confirming subscription', error);
        }
        res.status(error?.code || 500).json({ code: error?.code || 500, message: error?.message });
      });
  },
};

