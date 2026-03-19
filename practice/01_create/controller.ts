// ============================================================
// 練習: CreateTodoController の execute メソッドを実装する
// ============================================================
// 参考: src/controllers/CreateTodoController.ts
// ============================================================

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../../src/repositories/ITodoRepository";
import { AuthenticatedRequest } from "../../src/types/request";

export class CreateTodoController {
  // TODO: コンストラクタを書く
  //       private readonly repository: ITodoRepository を受け取る

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.body から title, body を取り出す

      // TODO: req.user.id から userId を取り出す

      // TODO: repository.save() を呼び出し、戻り値を todo に代入する

      // TODO: 201 Created で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
