import AWS from 'aws-sdk';
import Mail from 'nodemailer/lib/mailer';
import nodemailer from 'nodemailer';
import { TestService } from '@libUtils/testUtils';
import { catchFn } from '@libUtils/logger';

let transporter: Mail;

if (process.env.NODE_ENV === 'development') {
  transporter = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 1025,
  });
} else if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    SES: new AWS.SES({ region: process.env.AWS_REGION }),
  });
} else if (process.env.NODE_ENV === 'test') {
  transporter = {
    sendMail: sendTest,
  } as any;
} else {
  throw 'UNSUPPORTED ENVIRONMENT for EmailService'
}

export class EmailService {
  static async sendEmail(emailParams: Mail.Options): Promise<any> {
    return transporter.sendMail(emailParams)
      .catch(catchFn('Error sending email'));
  }
}

function sendTest(emailParams: Mail.Options) {
  if (!TestService?.Email?.sendEmail) {
    throw('TestService.Email.sendEmail is missing');
  }

  return TestService.Email.sendEmail(emailParams);
}
