import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { EMAIL_CONFIG, validateEmailConfig } from '@email/services/validateEmailConfig';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/signup-confirmation.html', 'utf-8');

validateEmailConfig('signupConfirmationRequired', {
  action_url: '{USER_ID}',
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
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending confirmation email', error);
      }
      return Promise.reject({ code: error.code || 500 , message: error.message || 'Error sending confirmation email', error });
    });
}
