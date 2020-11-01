import { Response } from 'express';
import _ from 'lodash';

import { AuthRequest } from '../routes/v1/Auth';

export const ProfileController = {
  index: async (req: AuthRequest, res: Response): Promise<any> => {
    return res.status(200).json({ item: req.user.toJson() });
  },

  update: async (req: AuthRequest, res: Response): Promise<any> => {
    const { user } = req.body;

    const validParams = _.omit(user, 'hash', 'email');

    return req.user.$query()
      .updateAndFetch(validParams)
      .then(update => {
        const response = update || req.user
        return res.status(200).json({ item: response.toJson() });
      })
      .catch((err) => {
        console.error(err);
        return res.status(422).json({ message: 'User is invalid' });
      });
  },
}
