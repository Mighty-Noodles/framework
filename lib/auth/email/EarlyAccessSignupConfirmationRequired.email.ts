import fs from 'fs';

import { User } from '@auth/models/User';
import { buildRawEmail } from '@email/services/buildRawEmail';
import { EmailService } from '@email/services/Email.service';

const EARLY_ACCESS_SIGNUP_CONFIRMATION_TEMPLATE = fs.readFileSync('./templates/emails/early-access-signup-confirmation.html', 'utf-8');

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
  token: string;
}

export async function sendEarlyAccessSignupConfirmationRequiredEmail({ user, token }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendRawEmail>> {
  const confirmUrl = `https://${process.env.DOMAIN}/api/v1/early_access/${user.id}/confirm?token=${token}`;

  const html = EARLY_ACCESS_SIGNUP_CONFIRMATION_TEMPLATE.replace(/{CONFIRM_URL}/g, confirmUrl);

  const message = await buildRawEmail({
    subject: 'Please confirm your subscription',
    to: user.email,
    from: SIGNUP_EMAIL_SENDER,
    html,
  });

  return EmailService.sendRawEmail(message)
    .catch(error => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error sending confirmation email', error);
      }
      return Promise.reject({ code: error.code || 500 , message: error.message || 'Error sending confirmation email', error });
    });
}
