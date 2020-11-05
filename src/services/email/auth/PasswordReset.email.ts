import fs from 'fs';

import { User } from '../../../models/User';
import { buildRawEmail } from '../buildRawEmail';
import { EmailService } from '../Email.service';

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

  const message = await buildRawEmail({
    subject: 'You forgot your password',
    to: user.email,
    from: RESET_PASSWORD_EMAIL_SENDER,
    html,
  });

  return EmailService.sendRawEmail(message)
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending email', error);
      }
      return Promise.reject({ code: error?.code || 500, message: error?.message || 'Error sending email', error });
    });
}
