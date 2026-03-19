// ============================================================
// 練習: UpdateTodoController の execute メソッドを実装する
// ============================================================
// 参考: src/controllers/UpdateTodoController.ts
// ============================================================

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { AuthenticatedRequest } from "../../src/types/request";

export class UpdateTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して id とする

      // TODO: req.user.id から userId を取り出す

      // TODO: req.body から title, body を取り出す

      // TODO: repository.update() を呼び出す

      // TODO: 200 OK で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
