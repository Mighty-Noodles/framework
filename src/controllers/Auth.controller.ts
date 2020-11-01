import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { AuthRequest } from '../routes/v1/Auth';
import { User } from '../models/User';

export const AuthController = {
  signup: async (req: AuthRequest, res: Response): Promise<any> => {
    const { first_name, last_name, email, password, password_confirmation } = req.body;

    const missingProps = ['first_name', 'last_name', 'email', 'password', 'password_confirmation'].filter(prop => {
      if (!req.body[prop]) {
        return prop;
      }
    });

    if (missingProps.length) {
      return res.status(422).json({
        message: 'Missing some props',
        missing_props: missingProps,
      });
    }

    if (password !== password_confirmation) {
      return res.status(422).json({
        message: 'Password confirmation does not match',
      });
    }

    if (password.length < 8) {
      return res.status(422).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    const exists = await User.query().findOne({ email });
    if (exists) {
      return res.status(422).json({
        message: 'Email is already taken',
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.query().insert({ email, first_name, last_name, hash });

    const token = jwt.sign({ user: user.id }, process.env.JWT_SECRET);

    res.status(200).json({
      item: user.toJson(),
      token,
    });
  },

  signin: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);

              const body = { id: user.id, email: user.email };
              const token = jwt.sign({ user: body }, process.env.JWT_SECRET);

              return res.status(200).json({ item: user.toJson(), token });
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  },
};

