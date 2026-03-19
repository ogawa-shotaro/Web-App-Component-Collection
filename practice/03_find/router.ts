// ============================================================
// 練習: GET /todos/:id のルートを定義する
// ============================================================
// 参考: src/routes/todos.ts（GET /:id 部分のみ）
// ============================================================

import { Router } from "express";
// TODO: authHandler をインポートする
// TODO: TodoRepository をインポートする
// TODO: FindTodoController をインポートする

// TODO: repository を new する
// TODO: findController を new する（repository を渡す）

export const todoRouter = Router();

todoRouter
  .route("/:id")
  // TODO: GET メソッドを定義する
  //       ミドルウェア: authHandler のみ
  //       コントローラー: findController.execute()
