import fs from 'fs';
import jwt from 'jsonwebtoken';
import { User } from "../../models/User";
import { buildRawEmail } from "../email/buildRawEmail";
import { EmailService } from "../email/EmailService";

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/signup-confirmation.html', 'utf-8');

const {
  SIGNUP_CONFIRMATION_EMAIL_SENDER,
 } = process.env;

export class ConfirmationService {
  static tokenGenerator(user: User): string {
    const secret = `${process.env.JWT_SECRET}-${user.id}-${user.created_at.toISOString()}`;

    return jwt.sign({
        id: user.id,
        email: user.email,
      },
      secret,
    );
  }

  static async requestConfirmation(user: User): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
    if (user.confirmed) {
      return Promise.reject({ message: 'User is already confirmed' });
    }

    const token = this.tokenGenerator(user);

    const confirmUrl = `https://${process.env.DOMAIN}/api/v1/signup/confirm?token=${token}`;

    const html = EMAIL_TEMPLATE.replace(/CONFIRM_URL/g, confirmUrl);

    const message = await buildRawEmail({
      subject: 'Please confirm your subscription',
      to: user.email,
      from: SIGNUP_CONFIRMATION_EMAIL_SENDER,
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
}
