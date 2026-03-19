// ============================================================
// 練習: listTodos 関数を実装する
// ============================================================
// 参考: frontend-react/src/api/todoApi.ts
// ============================================================

import type { Todo, TodoListParams } from "../../frontend-react/src/types/todo";

const BASE_URL = "http://localhost:3000";

export async function listTodos(params: TodoListParams, token: string): Promise<Todo[]> {
  // TODO: URLSearchParams で query を組み立てる
  //       params.page があれば "page" をセット
  //       params.count があれば "count" をセット

  // TODO: fetch で GET /todos?{query} を呼ぶ
  //       - headers: Authorization を付ける

  // TODO: res.ok でなければエラーを throw する

  // TODO: res.json() を Todo[] として return する
  throw new Error("Not implemented");
}
