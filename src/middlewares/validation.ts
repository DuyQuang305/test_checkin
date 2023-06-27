import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';

const Validation =
  (schema: Schema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<object> => {
    const body = req.body;

    try {
      await schema.validate(body);
      next();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  };

export default Validation;
