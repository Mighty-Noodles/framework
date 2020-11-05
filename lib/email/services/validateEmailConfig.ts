import _ from 'lodash';

const FILE = './templates/emails/email.config.json';
import EMAIL_CONFIG from 'templates/emails/email.config.json';

export { EMAIL_CONFIG };

export function validateEmailConfig(key: string, mandatoryProps: Record<string, string> = {}): void {
  const config = EMAIL_CONFIG[key];

  if (!config) {
    throw new Error(`'${key}' is missing in ${FILE}`);
  }

  if (!config.subject) {
    throw new Error(`'subject' in '${key}' is missing in ${FILE}`);
  }

  _.forEach(mandatoryProps, (match, propKey) => {
    if (!config[propKey]) {
      throw new Error(`'${propKey}' in '${key}' is missing and should contain '${match}' in ${FILE} `);
    }

    if (!config[propKey].match(match)) {
      throw new Error(`'${propKey}' in '${key}' should contain '${match}'`);
    }
  });
}
