// ============================================================
// 練習: updateTodo 関数を実装する
// ============================================================
// 参考: frontend-react/src/api/todoApi.ts
// ============================================================

import type { Todo, TodoUpdateInput } from "../../frontend-react/src/types/todo";

const BASE_URL = "http://localhost:3000";

export async function updateTodo(
  todoId: number,
  input: TodoUpdateInput,
  token: string
): Promise<Todo> {
  // TODO: fetch で PUT /todos/:todoId を呼ぶ
  //       - method: "PUT"
  //       - headers: Content-Type と Authorization を付ける
  //       - body: JSON.stringify(input)

  // TODO: res.ok でなければエラーを throw する

  // TODO: res.json() を Todo として return する
  throw new Error("Not implemented");
}
