import { Router } from 'express';
import { AuthService } from './Auth.service';

export class AuthController {
  router = Router();

  constructor() {
    const authService = new AuthService();
    this.router.post('/auth/signup', authService.register);
  }
}
