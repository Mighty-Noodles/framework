import bcrypt from 'bcrypt';

import { User } from '../../models/User';
import { ConfirmationService } from '../../services/auth/Confirmation.service';

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


interface SignupConfirmationParams {
  token: string;
  id: string;
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

    if (password.length < 8) {
      return Promise.reject({ code: 422, message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await User.query().findOne({ email });
    if (existingUser && existingUser.confirmed) {
      return Promise.reject({ code: 422, message: 'Email is already taken' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user =
      (existingUser && await existingUser.$query().updateAndFetch({ first_name, last_name, hash })) ||
      await User.query().insertAndFetch({ email, first_name, last_name, hash });

    return ConfirmationService.sendSignupConfirmationEmail(user)
      .then(() => user)
      .catch((err) => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Error sending confirmation email', err);
        }
        return Promise.reject({ code: err.code || 500, message: 'Error sending confirmation email' });
      });
  },

  confirmSignup: async (params: SignupConfirmationParams): Promise<User> => {
    return ConfirmationService.verify(params.token, params.id)
      .then(async user => {
        if (user.confirmed) {
          return user;
        }

        const updatedUser = await user.$query().updateAndFetch({ confirmed: true });
        await ConfirmationService.sendSubscriptionCompletedEmail(updatedUser);

        return updatedUser;
      })
      .catch(err => {
        return Promise.reject({ code: err?.code || 500, message: err?.message || 'Error confirming subscription' });
      });
  },
}
