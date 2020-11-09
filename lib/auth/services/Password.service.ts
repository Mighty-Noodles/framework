import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../models/User';
import { sendPasswordResetEmail } from '../email/PasswordReset.email';

interface PasswordResetParams {
  user: User;
  password: string;
  password_confirmation: string;
}

export class PasswordService {
  static resetPasswordTokenGenerator(user: User): string {
    const { RESET_PASSWORD_EXPIRATION } = process.env;

    const secret = this.tokenSecret(user);

    const options = RESET_PASSWORD_EXPIRATION ? {
      expiresIn: RESET_PASSWORD_EXPIRATION,
    } : undefined;

    return jwt.sign({
        id: user.id,
        email: user.email,
      },
      secret,
      options,
    );
  }

  private static tokenSecret(user: User): string {
    return `${process.env.JWT_SECRET}-${user.hash}-${user.id}-reset-password`;
  }

  static validatePasswordStrength(password = ''): Promise<void> {
    return new Promise((resolve, reject) => {
      if (password.length < 8) {
        return reject({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });
      }

      resolve();
    });
  }

  static async reset({ user, password, password_confirmation }: PasswordResetParams): Promise<User> {
    await this.validatePasswordStrength(password);

    if (password !== password_confirmation) {
      return Promise.reject({
        code: 422,
        message: 'Password confirmation do not match',
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const updatedUser = await User.query().updateAndFetchById(user.id, { hash });
    return Promise.resolve(updatedUser);
  }

  static async sendPasswordResetEmail({ email }: { email: string }): Promise<any> {
    if (!email) {
      return Promise.resolve();
    }

    const user = await User.query().findOne({ email });

    if (!user) {
      return Promise.resolve();
    }

    const token = this.resetPasswordTokenGenerator(user);

    return sendPasswordResetEmail({ user, token });
  }

  static async verify(token: string, id: string): Promise<User> {
    const user = await User.query().findById(id);

    if (!user) {
      return Promise.reject({
        code: 404,
        message: 'User not found',
      });
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.tokenSecret(user), (err) => {
        if (err) {
          reject({
            code: 401,
            message: 'Token is invalid',
          });
        }

        resolve(user);
      });
    });
  }
}
