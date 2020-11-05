import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { EMAIL_CONFIG, validateEmailConfig } from '@email/services/validateEmailConfig';
import { catchFn } from '@utils/logger';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/signupConfirmationRequired.html', 'utf-8');

validateEmailConfig('signupConfirmationRequired', EMAIL_TEMPLATE, {
  action_url: '{USER_ID}',
  body: '{ACTION_URL}',
});

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
  token: string;
}

export async function sendSignupConfirmationRequiredEmail({ user, token }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const { subject, action_url } = EMAIL_CONFIG['signupConfirmationRequired'];

  const actionUrl = `${action_url}?token=${token}`;
  const html = EMAIL_TEMPLATE
    .replace(/{ACTION_URL}/g, actionUrl);

  const message = {
    subject,
    to: user.email,
    from: SIGNUP_EMAIL_SENDER,
    html: replaceUserParams(html, user),
  };

  return EmailService.sendRawEmail(message)
    .catch(catchFn('Error sending subscription confirmation required email'));
}