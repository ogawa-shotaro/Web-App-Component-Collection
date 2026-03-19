// ============================================================
// 練習: createTodo 関数を実装する
// ============================================================
// 参考: frontend-react/src/api/todoApi.ts
// ============================================================

import type { Todo, TodoInput } from "../../frontend-react/src/types/todo";

const BASE_URL = "http://localhost:3000";

export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  // TODO: fetch で POST /todos を呼ぶ
  //       - method: "POST"
  //       - headers: Content-Type と Authorization を付ける
  //       - body: JSON.stringify(input)

  // TODO: res.ok でなければエラーを throw する

  // TODO: res.json() を Todo として return する
  throw new Error("Not implemented");
}
