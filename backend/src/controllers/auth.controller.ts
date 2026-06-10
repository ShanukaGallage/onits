import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * Controller for authentication endpoints.
 * 
 * Rules:
 * 1. login(req, res): calls authService.loginUser, sets HttpOnly cookie, returns 200/401.
 * 2. logout(req, res): clears the cookie, returns 200.
 * 3. Max 10-15 lines per function.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);
    res.cookie('token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({ message: 'Login successful', user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Invalid email or password" || message === "Your account has been deactivated" ? 401 : 500;
    res.status(status).json({ errorCode: status, message: status === 500 ? "Internal server error" : message });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}
