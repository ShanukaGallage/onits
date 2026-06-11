import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma, safeUserSelect, SafeUser } from "../config/db";

type AuthTokenPayload = JwtPayload & { sub: string };

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
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] }) as AuthTokenPayload;

    if (!decoded?.sub || typeof decoded.sub !== "string") {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: safeUserSelect,
    });

    if (!user || user.status === "Deactivated") {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
};
