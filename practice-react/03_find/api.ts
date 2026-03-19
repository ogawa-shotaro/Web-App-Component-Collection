// ============================================================
// 練習: findTodo 関数を実装する
// ============================================================
// 参考: frontend-react/src/api/todoApi.ts
// ============================================================

import type { Todo } from "../../frontend-react/src/types/todo";

const BASE_URL = "http://localhost:3000";

export async function findTodo(todoId: number, token: string): Promise<Todo> {
  // TODO: fetch で GET /todos/:todoId を呼ぶ
  //       - headers: Authorization を付ける

  // TODO: res.ok でなければエラーを throw する

  // TODO: res.json() を Todo として return する
  throw new Error("Not implemented");
}
