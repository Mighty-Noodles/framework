import { Request } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt';

import { User } from '../models/User';

export type AuthRequest = Request & { user: User };

export class AuthService {
  static passportJwt = (req, res, next) => passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;

    next();
  })(req, res, next);

  static adminPassportJwt = (req, res, next) => passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user || !user.admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;

    next();
  })(req, res, next);
}

passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.query().findOne({ email });

        if (!user) {
          return done(null, false, { message: 'Unauthorized' });
        }

        const validate = await bcrypt.compare(password, user.hash);

        if (!validate) {
          return done(null, false, { message: 'Unauthorized' });
        }

        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT')
    },
    async (token, done) => {
      console.log(token);
      const user = await User.query()
        .select('id', 'email', 'first_name', 'last_name', 'admin')
        .skipUndefined()
        .findOne({ id: token.id, email: token.email });

      if (user) {
        return done(null, user);
      } else {
        done('Not found');
      }
    }
  )
);
