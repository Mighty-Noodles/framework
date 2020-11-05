import { Request } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as localStrategy } from 'passport-local';
import { Strategy as JWTstrategy, ExtractJwt } from 'passport-jwt';

import { User } from '@auth/models/User';

export type AuthRequest = Request & { user: User };

if (!process.env.JWT_SECRET) {
  throw 'JWT_SECRET is not setup';
}

export class AuthService {
  static passportJwt = passport.authenticate('jwt', { session: false });
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
      const user = await User.query().select('id', 'email', 'first_name', 'last_name').findById(token.id);

      if (user) {
        return done(null, user);
      } else {
        done('Not found');
      }
    }
  )
);
