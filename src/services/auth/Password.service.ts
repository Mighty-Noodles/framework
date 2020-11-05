import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '../../models/User';
import { buildRawEmail } from '../email/buildRawEmail';
import { EmailService } from '../email/Email.service';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/password-reset.html', 'utf-8');

const {
  RESET_PASSWORD_EMAIL_SENDER,
 } = process.env;

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
    return `${process.env.JWT_SECRET}-${user.hash}-${user.id}-${user.created_at.toISOString()}-reset-password`;
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

  static async requestReset({ email }: { email: string }): Promise<any> {
    const user = await User.query().findOne({ email });

    if (!user) {
      return Promise.resolve();
    }

    const token = this.resetPasswordTokenGenerator(user);

    const resetLink = `https://${process.env.DOMAIN}/password_reset?token=${token}`;

    const html = EMAIL_TEMPLATE.replace(/RESET_URL/g, resetLink);

    const message = await buildRawEmail({
      subject: 'You forgot your password',
      to: email,
      from: RESET_PASSWORD_EMAIL_SENDER,
      html,
    });

    return EmailService.sendRawEmail(message)
      .catch(error => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending email', error);
        }
        return Promise.reject({ message: 'Error sending email', error });
      });
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
