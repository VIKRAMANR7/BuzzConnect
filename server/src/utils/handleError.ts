import type { Response } from "express";

export function handleControllerError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : "Something went wrong";

  console.error("❌ Controller Error:", message);

  res.status(500).json({
    success: false,
    message,
  });
}
