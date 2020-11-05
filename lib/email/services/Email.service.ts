import { TestService } from '@test/utils';
import {
  sendEmail as awsSendEmail,
  sendRawEmail as awsSendRawEmail,
  EmailParams,
  RawEmailParams
} from '../aws/SES.aws';

export class EmailService {
  static sendEmail(email: EmailParams): ReturnType<typeof awsSendEmail> {
    return TestService?.Email?.sendEmail(email) || awsSendEmail(email);
  }

  static sendRawEmail(email: RawEmailParams): ReturnType<typeof awsSendRawEmail> {
    return TestService?.Email?.sendRawEmail(email) || awsSendRawEmail(email);
  }
}
