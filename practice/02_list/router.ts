// ============================================================
// 練習: GET /todos のルートを定義する
// ============================================================
// 参考: src/routes/todos.ts（GET /todos 部分のみ）
// ============================================================

import { Router } from "express";
// TODO: authHandler をインポートする
// TODO: TodoRepository をインポートする
// TODO: ListTodoController をインポートする

// TODO: repository を new する
// TODO: listController を new する（repository を渡す）

export const todoRouter = Router();

todoRouter
  .route("/")
  // TODO: GET メソッドを定義する
  //       ミドルウェア: authHandler のみ（バリデーションなし）
  //       コントローラー: listController.execute()
