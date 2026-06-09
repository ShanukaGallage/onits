import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SafeUser } from "../config/db";

// Extend Express Request interface globally to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

/**
 * Authentication middleware that guards routes by verifying the HttpOnly token cookie.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "JWT secret is not configured",
      });
      return;
    }

    // Verify token and cast to SafeUser type
    const decoded = jwt.verify(token, jwtSecret) as SafeUser;
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
};
