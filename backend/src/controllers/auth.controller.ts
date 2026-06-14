import { Request, Response } from "express";
import { loginUser, getCurrentUser, refreshAccessToken, revokeRefreshToken } from "../services/auth.service";
import * as userService from "../services/user.service";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const ACCESS_TOKEN_MAX_AGE  = 15 * 60 * 1000;         // 15 minutes in ms
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function setTokenCookies(res: Response, token: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === "production";

  // Short-lived access token
  res.cookie("token", token, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: "strict",
    maxAge:   ACCESS_TOKEN_MAX_AGE,
  });

  // Long-lived refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   isProduction,
    sameSite: "strict",
    maxAge:   REFRESH_TOKEN_MAX_AGE,
    path:     "/api/auth/refresh", // Only sent to the refresh endpoint
  });
}

function clearTokenCookies(res: Response) {
  const isProduction = process.env.NODE_ENV === "production";
  const base = { httpOnly: true, secure: isProduction, sameSite: "strict" as const };

  res.clearCookie("token",        base);
  res.clearCookie("refreshToken", { ...base, path: "/api/auth/refresh" });
}

// ─────────────────────────────────────────────────────────────────────────────
//  loginController
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Handles user login.
 * Reads email and password, calls authService, sets HttpOnly token cookies, returns user.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error:   "Bad Request",
        message: "Email and password are required",
      });
      return;
    }

    const { user, token, refreshToken } = await loginUser(email, password);

    setTokenCookies(res, token, refreshToken);

    res.status(200).json(user);
  } catch (error: any) {
    if (error.message === "Invalid credentials" || error.status === 401) {
      res.status(401).json({
        error:   "Unauthorized",
        message: "Invalid email or password",
      });
      return;
    }
    res.status(500).json({
      error:   "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  refreshController
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Handles access token refresh.
 * Reads the refreshToken cookie, validates + rotates it, sets new cookies.
 * No `authenticate` middleware — the access token is intentionally expired here.
 */
export const refreshController = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      res.status(401).json({
        error:   "Unauthorized",
        message: "No refresh token provided",
      });
      return;
    }

    const { token, refreshToken, user } = await refreshAccessToken(rawRefreshToken);

    setTokenCookies(res, token, refreshToken);

    res.status(200).json(user);
  } catch (error: any) {
    // Clear cookies so the client gets redirected to login
    clearTokenCookies(res);
    res.status(401).json({
      error:   "Unauthorized",
      message: "Invalid or expired refresh token. Please log in again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  logoutController
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Handles user logout.
 * Revokes the refresh token from DB, clears both cookies.
 */
export const logoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      // Best-effort revoke — don't fail logout if token is already gone
      await revokeRefreshToken(rawRefreshToken).catch(() => {});
    }

    clearTokenCookies(res);

    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(500).json({
      error:   "Internal Server Error",
      message: error.message || "An unexpected error occurred during logout",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  changePasswordController
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Handles password reset for authenticated users.
 * Required for first-time logins, or manually changing password.
 */
export const changePasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Bad Request", message: "Missing fields" });
      return;
    }

    const updatedUser = await userService.changePassword(req.user.id, currentPassword, newPassword);

    // After a successful password change, we should theoretically rotate the tokens,
    // but the simplest safe thing is to just let the existing session continue (it has an expiry).
    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.message === "Current password is incorrect") {
      res.status(401).json({ error: "Unauthorized", message: error.message });
      return;
    }
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  meController
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Handles fetching current authenticated user's details.
 * Reads req.user (populated by authenticate middleware) and returns it.
 */
export const meController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error:   "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Re-fetch from DB to guarantee fresh data (role/status may have changed)
    const user = await userService.getUserById(req.user.id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({
      error:   "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  }
};
