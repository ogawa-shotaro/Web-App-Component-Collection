# 02 API 層（api/）

サーバーとの通信をすべてここに集約する。コンポーネントや hooks から `fetch` を直接呼ばない。

---

## 全体構成

```typescript
// api/todoApi.ts の全体像

const BASE_URL = ...          // constants/ からインポート

getHeaders(token)             // Authorization ヘッダーを組み立てる
handleResponse<T>(res)        // レスポンスの ok チェックと JSON 変換

createTodo(input, token)      // POST /todos
listTodos(params, token)      // GET /todos?page=&count=   → { items, total }
findTodo(todoId, token)       // GET /todos/:id
updateTodo(todoId, input, token) // PUT /todos/:id
deleteTodo(todoId, token)     // DELETE /todos/:id
```

---

## 解説

### getHeaders と handleResponse

全 API 関数で使い回す共通処理。1箇所で定義することで変更が楽になる。

```typescript
function getHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

`fetch` はネットワーク障害以外ではエラーを投げない（404 や 500 でも resolve する）。
`res.ok` で手動チェックして、失敗なら `Error` を throw することで、hooks 側で一律に `catch` できる。

### listTodos の戻り値

一覧取得はページネーションのために `{ items: Todo[], total: number }` を返す。
`total` が必要な理由：全件数がわかると「全部で何ページあるか」が計算できる。

```typescript
// PaginatedResponse<Todo> = { items: Todo[], total: number }
export async function listTodos(
  params: TodoListParams,
  token: string
): Promise<PaginatedResponse<Todo>> { ... }
```

---

## ドリル

```typescript
// api/todoApi.ts

import { BASE_URL, DEFAULT_PAGE_SIZE } from "../constants/api";
import type { Todo, TodoInput, TodoUpdateInput, TodoListParams, PaginatedResponse } from "../types/todo";

// ── 共通ユーティリティ ──────────────────────────────────────

// TODO: getHeaders(token) を実装する
//       戻り値: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
function getHeaders(token: string): HeadersInit {
  // TODO
}

// TODO: handleResponse<T>(res) を実装する
//       res.ok でなければ JSON の message を取り出して Error を throw する
//       res.ok なら res.json() を返す
async function handleResponse<T>(res: Response): Promise<T> {
  // TODO
}

// ── API 関数 ────────────────────────────────────────────────

// TODO: createTodo を実装する（POST /todos）
export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  // TODO
}

// TODO: listTodos を実装する（GET /todos?page=&count=）
//       クエリパラメータは URLSearchParams で組み立てる
//       戻り値の型は PaginatedResponse<Todo>
export async function listTodos(
  params: TodoListParams,
  token: string
): Promise<PaginatedResponse<Todo>> {
  // TODO
}

// TODO: findTodo を実装する（GET /todos/:id）
export async function findTodo(todoId: number, token: string): Promise<Todo> {
  // TODO
}

// TODO: updateTodo を実装する（PUT /todos/:id）
export async function updateTodo(
  todoId: number,
  input: TodoUpdateInput,
  token: string
): Promise<Todo> {
  // TODO
}

// TODO: deleteTodo を実装する（DELETE /todos/:id）
export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  // TODO
}
```

---

<details>
<summary>答え（確認用）</summary>

```typescript
import { BASE_URL } from "../constants/api";
import type { Todo, TodoInput, TodoUpdateInput, TodoListParams, PaginatedResponse } from "../types/todo";

function getHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

export async function listTodos(
  params: TodoListParams,
  token: string
): Promise<PaginatedResponse<Todo>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.count) query.set("count", String(params.count));

  const res = await fetch(`${BASE_URL}/todos?${query.toString()}`, {
    headers: getHeaders(token),
  });
  return handleResponse<PaginatedResponse<Todo>>(res);
}

export async function findTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(
  todoId: number,
  input: TodoUpdateInput,
  token: string
): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}
```

</details>
