// ============================================================
// 練習: DELETE /todos/:id のルートを定義する
// ============================================================
// 参考: src/routes/todos.ts（DELETE /:id 部分のみ）
// ============================================================

import { Router } from "express";
// TODO: authHandler をインポートする
// TODO: TodoRepository をインポートする
// TODO: DeleteTodoController をインポートする

// TODO: repository を new する
// TODO: deleteController を new する（repository を渡す）

export const todoRouter = Router();

todoRouter
  .route("/:id")
  // TODO: DELETE メソッドを定義する
  //       ミドルウェア: authHandler のみ（バリデーションなし）
  //       コントローラー: deleteController.execute()
