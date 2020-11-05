import MailComposer from 'nodemailer/lib/mail-composer';
import Mail from 'nodemailer/lib/mailer';

export const buildRawEmail = (params: Mail.Options): Promise<string> => {
  const mail = new MailComposer(params);

  return new Promise((resolve, reject) => {
    mail.compile().build(function(err, message){
      if (err) {
        return reject(err);
      }

      resolve(message.toString());
    });
  });
}
