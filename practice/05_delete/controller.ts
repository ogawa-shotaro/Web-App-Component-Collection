// ============================================================
// 練習: DeleteTodoController の execute メソッドを実装する
// ============================================================
// 参考: src/controllers/DeleteTodoController.ts
// ============================================================

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { AuthenticatedRequest } from "../../src/types/request";

export class DeleteTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して todoId とする
      //       ※ update の "id" とは変数名が違う点に注意

      // TODO: req.user.id から userId を取り出す

      // TODO: repository.remove() を呼び出す

      // TODO: 200 OK で削除した todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
