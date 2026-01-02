import type { Request, Response, NextFunction } from "express";

export async function protect(req: Request, res: Response, next: NextFunction) {
  const auth = req.auth?.();

  if (!auth) {
    res.status(401).json({
      success: false,
      message: "Authentication object missing",
    });
    return;
  }

  const { userId } = await auth;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
    return;
  }

  req.userId = userId;

  next();
}
