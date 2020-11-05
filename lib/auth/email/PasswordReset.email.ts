import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { validateEmailConfig, EMAIL_CONFIG } from '@email/services/validateEmailConfig';
import { catchFn } from '@utils/logger';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/passwordReset.html', 'utf-8');

const {
  RESET_PASSWORD_EMAIL_SENDER,
} = process.env;

validateEmailConfig('passwordReset', EMAIL_TEMPLATE, {
  action_url: 'http.*{USER_ID}',
  body: '{ACTION_URL}',
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
    .catch(catchFn('Error sending password reset email'));
}
