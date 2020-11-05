import { buildRawEmail } from './buildRawEmail';

describe('buildRawEmail', () => {
  const defaultParams = {
    subject: 'Check this out!',
    to: 'customer@email.com',
    from: 'from@company.com',
    html: '<h1>content</h1>',
  }

  test('builds email without attachment', async () => {
    const email = await buildRawEmail({
      ...defaultParams,
    });

    [
      'Content-Type: text/html; charset=utf-8',
      'From: from@company.com',
      'To: customer@email.com',
      'Subject: Check this out!',
      'Message-ID: <RANDOM_TEXT@company.com>',
      'Content-Transfer-Encoding: 7bit',
      'Date: RANDOM_TEXT',
      'MIME-Version: 1.0',
      '',
      '<h1>content</h1>',
    ].forEach(line => {
      expect(email).toEqual(expect.stringMatching(escapeRegex(line)));
    });
  });

  test('builds email with attachment', async () => {
    const email = await buildRawEmail({
      ...defaultParams,
      attachments: [{
        filename: 'screenshot.jpg',
        content: 'SOME_BASE_64_CONTENT',
        encoding: 'base64',
        cid: 'screenshot_cid',
      }],
    });

    [
      'Content-Type: image/jpeg; name=screenshot.jpg',
      'Content-ID: <screenshot_cid>',
      'Content-Transfer-Encoding: base64',
      'Content-Disposition: attachment; filename=screenshot.jpg',
      'SOME/BASE/64/CONTENT',
    ].forEach(line => {
      expect(email).toEqual(expect.stringMatching(escapeRegex(line)));
    });
  });
});

function escapeRegex(string) {
  return string
    // .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    .replace('RANDOM_TEXT', '.+');
}
