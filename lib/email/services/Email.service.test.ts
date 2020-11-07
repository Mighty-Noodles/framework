import { EmailService } from './Email.service';
import { testService } from '@libUtils/testUtils';

describe('EmailService', () => {
  describe('Password Reset Request', () => {
    describe('when TestService exists', () => {
      beforeAll(() => {
        testService({
          Email: {
            sendEmail: () => Promise.resolve('success'),
          },
        });
      });

      test('calls TestService sendEmail', async () => {
        await expect(EmailService.sendEmail({} as any)).resolves.toEqual('success');
      });
    });

    describe('when TestService does not exist', () => {
      beforeAll(() => {
        testService({});
      });

      test('raises error on sendEmail', async () => {
        await expect(EmailService.sendEmail({} as any)).rejects.toEqual('AWS should not be called from test');
      });
    })
  });
});
