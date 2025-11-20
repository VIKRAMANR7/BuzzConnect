import "express";

declare module "express" {
  interface Request {
    userId?: string;
    auth?: () => Promise<{ userId: string | null }>;
  }
}
