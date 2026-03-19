// ============================================================
// 練習: FindTodoController の execute メソッドを実装する
// ============================================================
// 参考: src/controllers/FindTodoController.ts
// ============================================================

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { AuthenticatedRequest } from "../../src/types/request";

export class FindTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して todoId とする

      // TODO: req.user.id から userId を取り出す

      // TODO: repository.findById() を呼び出す

      // TODO: 200 OK で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
