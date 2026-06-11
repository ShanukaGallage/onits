import { Request, Response } from "express";
// Import authService from service layer - Sajana will implement this
import { authService } from "../services/auth.service";

/**
 * Handles user login.
 * Reads email and password, calls authService, sets HttpOnly token cookie, and returns user.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Bad Request",
        message: "Email and password are required",
      });
      return;
    }

    const { user, token } = await authService.login(email, password);

    // Set JWT as HttpOnly, SameSite=Strict cookie with 7-day expiry
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.status(200).json(user);
  } catch (error: any) {
    // If invalid credentials, return 401
    if (error.message === "Invalid credentials" || error.status === 401) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
      return;
    }
    // General failure (500) - e.g. service skeleton throwing error
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};

/**
 * Handles user logout.
 * Clears the 'token' cookie and returns success response.
 */
export const logoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred during logout",
    });
  }
};

/**
 * Handles fetching current authenticated user's details.
 * Reads req.user (populated by authenticate middleware) and returns it.
 */
export const meController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    res.status(200).json(req.user);
  } catch (error: any) {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};
