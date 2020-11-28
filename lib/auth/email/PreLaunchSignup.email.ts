import fs from 'fs';

import { User } from '../models/User';
import { EmailService } from '../../email/services/Email.service';
import { replaceUserParams } from './replaceUserParams';
import { validateEmailConfig, EMAIL_CONFIG } from '../../email/services/validateEmailConfig';
import { catchFn } from '../../libUtils/logger';

const EMAIL_TEMPLATE = fs.readFileSync('./templates/emails/preLaunchSignup.html', 'utf-8');

validateEmailConfig('preLaunchSignup', EMAIL_TEMPLATE);

const {
  SIGNUP_EMAIL_SENDER,
 } = process.env;

interface TokenizedEmailParams {
  user: User;
}

export async function sendPreLaunchSignupEmail({ user }: TokenizedEmailParams): Promise<ReturnType<typeof EmailService.sendEmail>> {
  const { subject } = EMAIL_CONFIG['preLaunchSignup'];

  const message = {
    subject,
    to: user.email,
    from: SIGNUP_EMAIL_SENDER,
    html: replaceUserParams(EMAIL_TEMPLATE, user),
  };

  return EmailService.sendEmail(message)
    .catch(catchFn('Error sending subscription completed email'));
}
