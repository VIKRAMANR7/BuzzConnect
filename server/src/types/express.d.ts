declare global {
  namespace Express {
    interface Request {
      userId?: string;
      auth?: () => Promise<{ userId: string | null }>;
    }
  }
}

export {};
