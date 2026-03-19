import { Request } from "express";

// 認証済みリクエスト（authHandler 通過後に req.user が付与される）
export type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};
