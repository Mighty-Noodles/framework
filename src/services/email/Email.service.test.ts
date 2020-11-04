import { EmailService } from './Email.service';
import { testService } from '../../../tests/utils';

describe('EmailService', () => {
  describe('Password Reset Request', () => {
    describe('when TestService exists', () => {
      beforeAll(() => {
        testService({
          Email: {
            sendEmail: () => Promise.resolve('success plain'),
            sendRawEmail: () => Promise.resolve('success raw'),
          },
        });
      });

      test('calls TestService sendEmail', () => {
        expect(EmailService.sendEmail({} as any)).resolves.toEqual('success plain');
      });

      test('calls TestService sendRawEmail', () => {
        expect(EmailService.sendRawEmail({} as any)).resolves.toEqual('success raw');
      });
    });

    describe('when TestService does not exist', () => {
      beforeAll(() => {
        testService({});
      });

      test('raises error on sendEmail', () => {
        expect(EmailService.sendEmail({} as any)).rejects.toEqual('AWS should not be called from test');
      });

      test('raises error on sendRawEmail', () => {
        expect(EmailService.sendRawEmail({} as any)).rejects.toEqual('AWS should not be called from test');
      });
    })
  });
});
