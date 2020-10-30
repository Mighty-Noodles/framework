import { Response, Request } from 'express';

export const TestController = {
  index: (_req: Request, res: Response): void => {
    res.status(200).json({ hello: 'world' });
  },

  show: (req: Request, res: Response): void => {
    res.status(200).json({ id: req.params.id });
  },
}
