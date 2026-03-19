import { Request, Response, NextFunction } from "express";

// ※ スタブ（練習用）
// 実際はJWTを検証してreq.userにユーザー情報を付与する
export const authHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // JWT検証 → req.user = { id: ... } を付与
  next();
};
