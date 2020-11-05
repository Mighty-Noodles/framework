import { Response } from 'express';
import _ from 'lodash';

import { AuthRequest } from '@auth/routes/Passport';

export const ProfileController = {
  index: (req: AuthRequest, res: Response): void => {
    res.status(200).json({ item: req.user.toJson() });
  },

  update: async (req: AuthRequest, res: Response): Promise<void> => {
    const { user } = req.body;

    const validParams = _.omit(user, 'hash', 'email');

    return req.user.$query()
      .updateAndFetch(validParams)
      .then(update => {
        const response = update || req.user
        res.status(200).json({ item: response.toJson() });
      })
      .catch((err) => {
        console.error(err);
        res.status(422).json({ message: 'User is invalid' });
      });
  },
}
