import fs from 'fs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { buildRawEmail } from '../email/buildRawEmail';
import { EmailService } from '../email/Email.service';

const SIGNUP_CONFIRMATION_TEMPLATE = fs.readFileSync('./templates/emails/signup-confirmation.html', 'utf-8');
const SUBSCRIPTION_COMPLETED_TEMPLATE = fs.readFileSync('./templates/emails/subscription-completed.html', 'utf-8');

const {
  SIGNUP_CONFIRMATION_EMAIL_SENDER,
 } = process.env;

export class ConfirmationService {
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
        code: 401,
        message: 'User not found',
      });
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.tokenSecret(user), (err) => {
        if (err) {
          reject({
            code: 400,
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

    const confirmUrl = `https://${process.env.DOMAIN}/api/v1/signup/${user.id}/confirm?token=${token}`;

    const html = SIGNUP_CONFIRMATION_TEMPLATE.replace(/CONFIRM_URL/g, confirmUrl);

    const message = await buildRawEmail({
      subject: 'Please confirm your subscription',
      to: user.email,
      from: SIGNUP_CONFIRMATION_EMAIL_SENDER,
      html,
    });

    return EmailService.sendRawEmail(message)
      .catch(error => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending confirmation email', error);
        }
        return Promise.reject({ code: error.code || 500 , message: 'Error sending confirmation email', error });
      });
  }

  static async sendSubscriptionCompletedEmail(user: User): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
    if (!user.confirmed) {
      return Promise.reject({ code: 400, message: 'User did not confirm subscription' });
    }

    const token = this.tokenGenerator(user);

    const confirmUrl = `https://${process.env.DOMAIN}/api/v1/signup/${user.id}/confirm?token=${token}`;

    const html = SUBSCRIPTION_COMPLETED_TEMPLATE.replace(/CONFIRM_URL/g, confirmUrl);

    const message = await buildRawEmail({
      subject: 'Welcome',
      to: user.email,
      from: SIGNUP_CONFIRMATION_EMAIL_SENDER,
      html,
    });

    return EmailService.sendRawEmail(message)
      .catch(error => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending subscription completed email', error);
        }
        return Promise.reject({ code: error?.code || 500 , message: 'Error sending subscription completed email', error });
      });
  }
}
