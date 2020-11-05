import fs from 'fs';

import { User } from '@auth/models/User';
import { EmailService } from '@email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';

const SIGNUP_CONFIRMATION_TEMPLATE = fs.readFileSync('./templates/emails/signup-confirmation.html', 'utf-8');

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
  token: string;
}

export async function sendSignupConfirmationRequiredEmail({ user, token }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const confirmUrl = `https://${process.env.DOMAIN}/api/v1/signup/${user.id}/confirm?token=${token}`;

  const html = SIGNUP_CONFIRMATION_TEMPLATE
    .replace(/{CONFIRM_URL}/g, confirmUrl);

  const message = {
    subject: 'Please confirm your subscription',
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
