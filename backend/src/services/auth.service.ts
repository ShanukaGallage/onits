import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, safeUserSelect, SafeUser } from "../config/db";

export const authService = {
  async login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret is not configured");
    }

    const userWithPassword = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { ...safeUserSelect, passwordHash: true },
    });

    if (!userWithPassword || userWithPassword.status === "Deactivated") {
      const err: any = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const passwordOk = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!passwordOk) {
      const err: any = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const { passwordHash: _passwordHash, ...user } = userWithPassword;

    const token = jwt.sign({ sub: user.id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
      algorithm: "HS256",
    });

    return { user, token };
  },
};
