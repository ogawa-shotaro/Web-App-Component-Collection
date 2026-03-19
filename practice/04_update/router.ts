// ============================================================
// 練習: PUT /todos/:id のルートを定義する
// ============================================================
// 参考: src/routes/todos.ts（PUT /:id 部分のみ）
// ============================================================

import { Router } from "express";
// TODO: authHandler をインポートする
// TODO: validator をインポートする
// TODO: updateTodoSchema をインポートする
// TODO: TodoRepository をインポートする
// TODO: UpdateTodoController をインポートする

// TODO: repository を new する
// TODO: updateController を new する（repository を渡す）

export const todoRouter = Router();

todoRouter
  .route("/:id")
  // TODO: PUT メソッドを定義する
  //       ミドルウェア: authHandler → validator(updateTodoSchema) → controller.execute()
