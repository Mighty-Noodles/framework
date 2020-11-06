import { TestService } from '@libUtils/testUtils';
import {
  sendEmail as awsSendEmail,
  sendRawEmail as awsSendRawEmail,
  EmailParams
} from '../aws/SES.aws';
import Mail from 'nodemailer/lib/mailer';
import { buildRawEmail } from './buildRawEmail';

export class EmailService {
  static sendEmail(email: EmailParams): ReturnType<typeof awsSendEmail> {
    return TestService?.Email?.sendEmail(email) || awsSendEmail(email);
  }

  static async sendRawEmail(emailParams: Mail.Options): Promise<ReturnType<typeof awsSendRawEmail>> {
    const email = await buildRawEmail(emailParams);

    return TestService?.Email?.sendRawEmail(email) || awsSendRawEmail(email);
  }
}
