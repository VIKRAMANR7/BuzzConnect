import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("❌ Server Error:", err);

  return res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
  });
}
