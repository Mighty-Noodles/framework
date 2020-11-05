import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/password-reset.html', 'utf-8');

const {
  RESET_PASSWORD_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
  token: string;
}

export async function sendPasswordResetEmail({ user, token }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const resetLink = `https://${process.env.DOMAIN}/password_reset?token=${token}`;

  const html = EMAIL_TEMPLATE.replace(/{RESET_URL}/g, resetLink);

  const message = {
    subject: 'You forgot your password',
    to: user.email,
    from: RESET_PASSWORD_EMAIL_SENDER,
    html: replaceUserParams(html, user),
  };

  return EmailService.sendRawEmail(message)
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending email', error);
      }
      return Promise.reject({ code: error?.code || 500, message: error?.message || 'Error sending email', error });
    });
}
