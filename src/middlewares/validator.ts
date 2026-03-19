import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// ※ スタブ（練習用）
// ZodスキーマでリクエストBodyをバリデーションするミドルウェアを返す
export const validator =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
