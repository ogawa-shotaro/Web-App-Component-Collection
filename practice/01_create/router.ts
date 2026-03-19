// ============================================================
// 練習: POST /todos のルートを定義する
// ============================================================
// 参考: src/routes/todos.ts（POST部分のみ）
// ============================================================

import { Router } from "express";
// TODO: authHandler をインポートする
// TODO: validator をインポートする
// TODO: createTodoSchema をインポートする
// TODO: TodoRepository をインポートする
// TODO: CreateTodoController をインポートする

// TODO: repository を new する
// TODO: createController を new する（repository を渡す）

export const todoRouter = Router();

todoRouter
  .route("/")
  // TODO: POST メソッドを定義する
  //       ミドルウェア: authHandler → validator(createTodoSchema) → controller.execute()
