import { User } from '@auth/models/User';
import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { PasswordService } from '@auth/services/Password.service';
import { SignupService } from '@auth/services/Signup.service';

const MANDATORY_SIGNUP_FIELDS = [
  'first_name',
  'email',
];

interface SignupParams {
  first_name: string;
  last_name: string;
  email: string;
}

interface SignupConfirmationParams {
  user: User;
  password?: string;
  password_confirmation?: string;
}

export const EarlyAccessSignupService = {
  signup: async (params: SignupParams): Promise<User> => {
    const { first_name, last_name, email } = params;

    const missingProps = MANDATORY_SIGNUP_FIELDS.filter(prop => {
      if (!params[prop]) {
        return prop;
      }
    });

    if (missingProps.length) {
      return Promise.reject({ code: 422, message: 'Missing some props', missing_props: missingProps });
    }

    const existingUser = await User.query().findOne({ email });
    if (existingUser && existingUser.confirmed) {
      return Promise.reject({ code: 422, message: 'Email is already taken' });
    }

    const user = existingUser || await User.query().insertAndFetch({ email, first_name, last_name });

    return SignupConfirmationService.sendEarlyAccessSignupConfirmationEmail(user)
      .then(() => user)
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending early access confirmation email', err);
        }
        return Promise.reject({ code: err.code || 500, message: err.message || 'Error sending early access confirmation email' });
      });
  },

  confirmSignup: async ({ user, password, password_confirmation}: SignupConfirmationParams): Promise<User> => {
    if (user.confirmed) {
      return user;
    }

    await PasswordService.reset({ user, password, password_confirmation })
      .then((user) => SignupService.confirmSignup(user))
      .catch(err => {
        return Promise.reject({ code: err?.code || 500, message: err?.message || 'Error confirming early access subscription' });
      });
    return await user.$query().updateAndFetch({ confirmed: true });
  },
}
