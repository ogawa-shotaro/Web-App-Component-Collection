// ============================================================
// 練習: deleteTodo 関数を実装する
// ============================================================
// 参考: frontend-react/src/api/todoApi.ts
// ============================================================

import type { Todo } from "../../frontend-react/src/types/todo";

const BASE_URL = "http://localhost:3000";

export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  // TODO: fetch で DELETE /todos/:todoId を呼ぶ
  //       - method: "DELETE"
  //       - headers: Authorization を付ける（body は不要）

  // TODO: res.ok でなければエラーを throw する

  // TODO: res.json() を Todo として return する
  throw new Error("Not implemented");
}
