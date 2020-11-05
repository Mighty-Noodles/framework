import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { validateEmailConfig, EMAIL_CONFIG } from '@email/services/validateEmailConfig';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/signupCompleted.html', 'utf-8');

validateEmailConfig('signupCompleted', EMAIL_TEMPLATE);

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
}

export async function sendSignupCompletedEmail({ user }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const { subject } = EMAIL_CONFIG['signupCompleted'];

  const message = {
    subject,
    to: user.email,
    from: SIGNUP_EMAIL_SENDER,
    html: replaceUserParams(EMAIL_TEMPLATE, user),
  };

  return EmailService.sendRawEmail(message)
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending subscription completed email', error);
      }
      return Promise.reject({ code: error?.code || 500 , message: error.message || 'Error sending subscription completed email', error });
    });
}
