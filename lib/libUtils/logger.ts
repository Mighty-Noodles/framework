/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-ts-comment */

import debug from 'debug';
import { Response, Request } from 'express';
import _ from 'lodash';
import { AuthRequest } from '../auth/routes/Passport';
import { EmailService } from '../email/services/Email.service';

const appLog = debug('app');
const errorLogDebug = debug('app:error');

errorLogDebug.enabled = process.env.DEBUG !== 'false';

const COLOR = {
  // Color list on https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',

  RESET: '\x1b[0m',
};

function errorLog(...params): void {
  const errorDisplay = [COLOR.RED, 'ERROR', COLOR.RESET];

  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const log = [...errorDisplay, ...params];
  // @ts-ignore
  errorLogDebug(...log);
}

const controllerCatchFn = (defaultMessage = 'Some error occurred', req: Request | AuthRequest, res: Response) => (error: any): void => {
  if (!error?.code || error?.code >= 500) {
    errorLog(defaultMessage, error);
  }

  const code = error?.code || 500;
  const message = code >= 500 ? defaultMessage : error?.message;

  res.status(code).json({ code, message });

  if (code >= 500) {
    sendErrorEmail(req, error);
  }
};

const sendErrorEmail = (req: Request | AuthRequest, error: any) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // @ts-ignore
  const user = req.user ? [req.user?.id, req.user?.email].join(' / ') : '';

  return EmailService.sendEmail({
    to: process.env.ERROR_EMAIL_RECIPIENT,
    from: process.env.ERROR_EMAIL_SENDER,
    subject: `[ERROR] ${process.env.APP_NAME}`,
    html: `
      <h2>${process.env.APP_NAME}</h2>

      <h3>And error ocurred in the app.</h3>

      <ul>
        <li>Host: ${req.headers.host}</li>
        <li>originalUrl: ${req.method} ${req.originalUrl}</li>
        <li>From: ${req.headers.referer}</li>
      </ul>

      <h3>User</h3>

      ${user}

      <h2>Query:</h2>

      <pre>
        ${JSON.stringify(req.query)}
      </pre>

      <h2>Body:</h2>

      <pre>
        ${JSON.stringify(_.omit(req.body, 'password'))}
      </pre>

      <h2>${error?.message}</h2>

      <pre>
        ${error}
      </pre>

      <pre>
        ${error?.stack}
      </pre>
    `
  });
};

const catchFn = (defaultMessage = 'Some error occurred') => (error: any): Promise<any> => {
  const code = (_.isNumber(error?.code) && error?.code) || 500;
  const message = error?.message || defaultMessage;

  return Promise.reject({ code, message });
};

const ignoreCatchFn = (defaultMessage = 'Some error occurred', defaultReturn?: any) => (error: any): Promise<any> => {
  const message = error?.message || defaultMessage;

  errorLog(message, error);

  return Promise.resolve(defaultReturn);
};

export {
  appLog,
  errorLog,
  catchFn,
  controllerCatchFn,
  ignoreCatchFn,
};
