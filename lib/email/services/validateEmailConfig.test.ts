import { validateEmailConfig } from '@email/services/validateEmailConfig';

const CONFIG = {
  hello: {
    subject: 'Hello!',
    action_url: 'http://{NAME}.com',
  },
  noSubject: {
    subject: '',
  },
  missingActionUrl: {
    subject: 'My subject',
  },
  actionBody: {
    subject: 'My subject',
  }
}

describe('validateEmailConfig', () => {
  test('on success', async () => {
    await expect(
      () => validateEmailConfig(
        'hello',
        '<h1>{BODY}</h1>', {
          action_url: 'http.+{NAME}',
          body: '{BODY}'
        }, CONFIG)
    ).not.toThrow();
  });

  test('validates presence of config', async () => {
    await expect(
      () => validateEmailConfig('missingConfig', '', {}, CONFIG)
    ).toThrowError("[EMAIL CONFIG] 'missingConfig' is missing")
  });

  test('validates subject', async () => {
    await expect(
      () => validateEmailConfig('noSubject', '<h1>body</h1>', {}, CONFIG)
    ).toThrowError("[EMAIL CONFIG] 'subject' in 'noSubject' is missing")
  });

  test('validates presence of action_url', async () => {
    await expect(
      () => validateEmailConfig('missingActionUrl', '<h1>body</h1>', { action_url: '{NAME}' }, CONFIG)
    ).toThrowError("[EMAIL CONFIG] 'action_url' in 'missingActionUrl' is missing and should match '{NAME}'");
  });

  test('validates matching action_url', async () => {
    await expect(
      () => validateEmailConfig('hello', '<h1>body</h1>', { action_url: '{WRONG}' }, CONFIG)
    ).toThrowError("[EMAIL CONFIG] 'action_url' in 'hello' should match '{WRONG}'");
  });

  test('validates info in body', async () => {
    await expect(
      () => validateEmailConfig('actionBody', '<h1>body</h1>', { body: '{ACTION}'}, CONFIG)
    ).toThrowError("[EMAIL CONFIG] Email template in 'actionBody' should match '{ACTION}'");
  });
});
