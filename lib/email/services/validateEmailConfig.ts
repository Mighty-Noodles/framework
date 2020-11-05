import _ from 'lodash';

import EMAIL_CONFIG from 'templates/emails/email.config.json';

export { EMAIL_CONFIG };

interface EmailConfig {
  [key: string]: {
    subject: string;
  },
}

const ERROR_PREFIX = '[EMAIL CONFIG]';

export function validateEmailConfig(key: string, body: string, mandatoryProps: Record<string, string> = {}, configuration: EmailConfig = EMAIL_CONFIG): void {
  const config = configuration[key];

  if (!config) {
    throw new Error(`${ERROR_PREFIX} '${key}' is missing`);
  }

  if (!config.subject) {
    throw new Error(`${ERROR_PREFIX} 'subject' in '${key}' is missing`);
  }

  _.forEach(mandatoryProps, (match, propKey) => {
    if (propKey === 'body') {
      return;
    }

    if (!config[propKey]) {
      throw new Error(`${ERROR_PREFIX} '${propKey}' in '${key}' is missing and should match '${match}'`);
    }

    if (!config[propKey].match(match)) {
      throw new Error(`${ERROR_PREFIX} '${propKey}' in '${key}' should match '${match}'`);
    }
  });

  if (mandatoryProps.body) {
    if (!body.match(mandatoryProps.body)) {
      throw new Error(`${ERROR_PREFIX} Email template in '${key}' should match '${mandatoryProps.body}'`);
    }
  }
}
