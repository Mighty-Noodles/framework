import { Response, Request } from 'express';
import { User } from '../models/User';

export const TestController = {
  index: async (_req: Request, res: Response): Promise<void> => {
    const users = await User.query();

    res.status(200).json({ items: users });
  },

  show: async (req: Request, res: Response): Promise<void> => {
    const user = await User.query().findById(req.params.id);

    res.status(200).json({ item: user });
  },
}
