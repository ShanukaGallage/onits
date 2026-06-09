import { SafeUser } from "../config/db";

// Sajana will implement this service.
// This is a temporary skeleton matching the agreed signature to enable parallel work.
export const authService = {
  async login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
    throw new Error("authService.login is not implemented yet");
  }
};
