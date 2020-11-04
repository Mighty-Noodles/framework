import fs from 'fs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { buildRawEmail } from '../email/buildRawEmail';
import { EmailService } from '../email/Email.service';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/password-reset.html', 'utf-8');

const {
  RESET_PASSWORD_EMAIL_SENDER,
 } = process.env;

export class PasswordService {
  static resetPasswordTokenGenerator(user: User): string {
    const { RESET_PASSWORD_EXPIRATION } = process.env;

    const secret = `${process.env.JWT_SECRET}-${user.hash}-${user.id}-${user.created_at.toISOString()}`;

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
      .then((res) => Promise.resolve(res))
      .catch(error => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending email', error);
        }
        return Promise.reject({ message: 'Error sending email', error });
      });
  }
}
