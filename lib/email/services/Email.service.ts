import AWS from 'aws-sdk';
import Mail from 'nodemailer/lib/mailer';
import nodemailer from 'nodemailer';
import { TestService } from '../../libUtils/testUtils';
import { catchFn } from '../../libUtils/logger';

const transporter = getTransporter();

export class EmailService {
  static async sendEmail(emailParams: Mail.Options): Promise<any> { // eslint-disable-line
    return transporter.sendMail(emailParams)
      .catch(catchFn('Error sending email'));
  }
}

function getTransporter(): Mail {
  switch (process.env.NODE_ENV) {
    case 'test':
      return {
        sendMail: sendTest,
      } as any; // eslint-disable-line
    case 'production':
      return nodemailer.createTransport({
        SES: new AWS.SES({ region: process.env.AWS_REGION }),
      });
    case 'development':
    default:
      return nodemailer.createTransport({
        host: '127.0.0.1',
        port: 1025,
      });
  }
}

function sendTest(emailParams: Mail.Options) {
  if (!TestService?.Email?.sendEmail) {
    throw('TestService.Email.sendEmail is missing');
  }

  return TestService.Email.sendEmail(emailParams);
}
