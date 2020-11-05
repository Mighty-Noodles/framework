import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { sendSignupConfirmationRequiredEmail } from '../email/auth/SignupConfirmationRequired.email';
import { sendEarlyAccessSignupConfirmationRequiredEmail } from '../email/auth/EarlyAccessSignupConfirmationRequired.email';
import { sendSignupCompletedEmail } from '../email/auth/SignupCompleted.email';
import { EmailService } from '../email/Email.service';

export class SignupConfirmationService {
  static tokenGenerator(user: User): string {
    const secret = this.tokenSecret(user);

    return jwt.sign({
        id: user.id,
        email: user.email,
      },
      secret,
    );
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

  private static tokenSecret(user: User): string {
    return `${process.env.JWT_SECRET}-${user.id}-${user.created_at.toISOString()}-signup-confirmation`;
  }

  static async sendSignupConfirmationEmail(user: User): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
    if (user.confirmed) {
      return Promise.reject({ message: 'User is already confirmed' });
    }

    const token = this.tokenGenerator(user);

    return sendSignupConfirmationRequiredEmail({ user, token });
  }

  static async sendSubscriptionCompletedEmail(user: User): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
    if (!user.confirmed) {
      return Promise.reject({ code: 400, message: 'User did not confirm subscription' });
    }

    return sendSignupCompletedEmail({ user });
  }

  static async sendEarlyAccessSignupConfirmationEmail(user: User): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
    if (user.confirmed) {
      return Promise.reject({ message: 'User is already confirmed' });
    }

    const token = this.tokenGenerator(user);

    return sendEarlyAccessSignupConfirmationRequiredEmail({ user, token });
  }
}
