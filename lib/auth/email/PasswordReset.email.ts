import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { validateEmailConfig, EMAIL_CONFIG } from '@email/services/validateEmailConfig';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/password-reset.html', 'utf-8');

const {
  RESET_PASSWORD_EMAIL_SENDER,
} = process.env;

validateEmailConfig('passwordReset', {
  action_url: 'http.*{USER_ID}',
});

interface TokenizedEmailParams {
  user: User;
  token: string;
}

export async function sendPasswordResetEmail({ user, token }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const { subject, action_url } = EMAIL_CONFIG['passwordReset'];

  const actionUrl = `${action_url}?token=${token}`;
  const html = EMAIL_TEMPLATE
    .replace(/{ACTION_URL}/g, actionUrl);

  const message = {
    subject,
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
