import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { RegisterUser, LoginUser } from './auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body as LoginUser);
    res.status(200).json(result);
  };

  public register = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email is required and must be a string' });
      return;
    }

    const result = await this.authService.register(req.body as RegisterUser);
    res.status(201).json(result);
  };
}
