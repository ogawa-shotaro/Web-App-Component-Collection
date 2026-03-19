// ============================================================
// 練習: ListTodoController の execute メソッドを実装する
// ============================================================
// 参考: src/controllers/ListTodoController.ts
// ============================================================

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { AuthenticatedRequest } from "../../src/types/request";

export class ListTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.user.id から userId を取り出す

      // TODO: req.query.page を Number に変換する（存在しない場合は undefined）
      // TODO: req.query.count を Number に変換する（存在しない場合は undefined）

      // TODO: repository.list() を呼び出し、戻り値を result に代入する

      // TODO: 200 OK で result を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
