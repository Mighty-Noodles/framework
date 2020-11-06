import bcrypt from 'bcrypt';

import { User } from '@auth/models/User';
import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { PasswordService } from '@auth/services/Password.service';
import { catchFn } from '@libUtils/logger';

const MANDATORY_SIGNUP_FIELDS = [
  'first_name',
  'email',
  'password',
  'password_confirmation',
];

interface SignupParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string
}

export const SignupService = {
  signup: async (params: SignupParams): Promise<User> => {
    const { first_name, last_name, email, password, password_confirmation } = params;

    const missingProps = MANDATORY_SIGNUP_FIELDS.filter(prop => {
      if (!params[prop]) {
        return prop;
      }
    });

    if (missingProps.length) {
      return Promise.reject({ code: 422, message: 'Missing some props', missing_props: missingProps });
    }

    if (password !== password_confirmation) {
      return Promise.reject({ code: 422, message: 'Password confirmation does not match' });
    }

    await PasswordService.validatePasswordStrength(password);

    const existingUser = await User.query().findOne({ email });
    if (existingUser && existingUser.confirmed) {
      return Promise.reject({ code: 422, message: 'Email is already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user =
      (existingUser && await existingUser.$query().updateAndFetch({ first_name, last_name, hash })) ||
      await User.query().insertAndFetch({ email, first_name, last_name, hash });

    return SignupConfirmationService.sendSignupConfirmationEmail(user)
      .then(() => user)
      .catch(catchFn('Error sending confirmation email'));
  },

  confirmSignup: async (user: User): Promise<User> => {
    try {
      if (user.confirmed) {
        return Promise.resolve(user);
      }

      const updatedUser = await user.$query().updateAndFetch({ confirmed: true });
      await SignupConfirmationService.sendSubscriptionCompletedEmail(updatedUser);

      return Promise.resolve(updatedUser);
    } catch (err) {
      return catchFn('Error confirming subscription')(err);
    }
  },
}
