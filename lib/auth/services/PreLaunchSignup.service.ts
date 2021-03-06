import { User } from '../models/User';
import { SignupConfirmationService } from '../services/SignupConfirmation.service';

import { catchFn } from '../../libUtils/logger';

const MANDATORY_SIGNUP_FIELDS = [
  'first_name',
  'email',
];

interface SignupParams {
  first_name: string;
  last_name: string;
  email: string;
  metadata?: Record<string, unknown>;
}

export const PreLaunchSignupService = {
  signup: async (params: SignupParams): Promise<User> => {
    const { first_name, last_name, email, metadata } = params;

    const missingProps = MANDATORY_SIGNUP_FIELDS.filter(prop => {
      if (!params[prop]) {
        return prop;
      }
    });

    if (missingProps.length) {
      return Promise.reject({ code: 422, message: 'Missing some props', missing_props: missingProps });
    }

    const existingUser = await User.query().findOne({ email });
    if (existingUser) {
      return Promise.reject({ code: 422, message: 'Email is already taken' });
    }

    const user = existingUser || await User.query().insertAndFetch({
      email,
      first_name,
      last_name,
      metadata,
    });

    return SignupConfirmationService.sendPreLaunchSignupEmail(user)
      .then(() => user)
      .catch(catchFn('Error sending pre-launch confirmation email'));
  },
}
