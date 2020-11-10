/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-ts-comment */

import debug from 'debug';
import { Response } from 'express';
import _ from 'lodash';

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

const controllerCatchFn = (defaultMessage = 'Some error occurred', res: Response) => (error: any): void => {
  if (!error?.code || error?.code >= 500) {
    errorLog(defaultMessage, error);
  }

  const code = error?.code || 500;
  const message = code >= 500 ? defaultMessage : error?.message;

  res.status(code).json({ code, message });
};

const catchFn = (defaultMessage = 'Some error occurred') => (error: any): Promise<any> => {
  const code = (_.isNumber(error?.code) && error?.code) || 500;
  const message = error?.message || defaultMessage;

  return Promise.reject({ code, message });
};

export {
  appLog,
  errorLog,
  catchFn,
  controllerCatchFn,
};
