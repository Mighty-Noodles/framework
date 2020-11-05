import fs from 'fs';

import { User } from '@auth/models/User';
import { buildRawEmail } from '@email/services/buildRawEmail';
import { EmailService } from '@email/services/Email.service';

const SUBSCRIPTION_COMPLETED_TEMPLATE = fs.readFileSync('./templates/emails/subscription-completed.html', 'utf-8');

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
}

export async function sendSignupCompletedEmail({ user }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const message = await buildRawEmail({
    subject: 'Welcome',
    to: user.email,
    from: SIGNUP_EMAIL_SENDER,
    html: SUBSCRIPTION_COMPLETED_TEMPLATE,
  });

  return EmailService.sendRawEmail(message)
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending subscription completed email', error);
      }
      return Promise.reject({ code: error?.code || 500 , message: error.message || 'Error sending subscription completed email', error });
    });
}
