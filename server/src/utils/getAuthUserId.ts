import type { Request } from "express";

export async function getAuthUserId(req: Request): Promise<string> {
  const authFn = req.auth;

  if (!authFn) {
    throw new Error("Authentication missing");
  }

  const { userId } = await authFn();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  return userId;
}
