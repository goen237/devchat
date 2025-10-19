import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      username?: string;
      semester?: number;
      // weitere Felder nach Bedarf
    }
  }
}
