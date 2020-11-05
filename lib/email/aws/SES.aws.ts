import AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

const SES = new AWS.SES({ region: process.env.AWS_REGION });

export type RawEmailParams = string;
export type EmailParams = AWS.SES.Types.SendEmailRequest;

const IS_TEST = process.env.NODE_ENV === 'test';

export const sendRawEmail = (email: string): Promise<PromiseResult<AWS.SES.SendRawEmailResponse, AWS.AWSError>> => {
  if (IS_TEST) {
    return Promise.reject('AWS should not be called from test');
  }

  return SES.sendRawEmail({RawMessage: { Data: email }})
    .promise()
    .catch(err => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('ERROR: AWS sendRawEmail', err);
      }
      return Promise.reject({ code: 502, message: 'Error sending email' });
    });
}

export const sendEmail = (email: AWS.SES.Types.SendEmailRequest): Promise<PromiseResult<AWS.SES.SendRawEmailResponse, AWS.AWSError>> => {
  if (IS_TEST) {
    return Promise.reject('AWS should not be called from test');
  }

  return SES.sendEmail(email)
    .promise()
    .catch(err => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('ERROR: AWS sendEmail', err);
      }
      return Promise.reject({ code: 502, message: 'Error sending email' });
    });
}
