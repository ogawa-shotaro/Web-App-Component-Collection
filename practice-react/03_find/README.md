# 03 Find（1件取得）

## 全体像

```
コンポーネントのマウント（todoId が変わるたびに再フェッチ）
  └─ FindTodo コンポーネント  ← 詳細表示・UI
       └─ useFindTodo フック  ← 自動フェッチ・状態管理
            └─ findTodo 関数  ← GET /todos/:id
```

---

## 解説

### API 関数（findTodo）

URL に `todoId` を埋め込む：`` `${BASE_URL}/todos/${todoId}` ``
GET かつ body なしなので `method` の指定は不要。ヘッダーに認証情報だけ付ければよい。

### カスタムフック（useFindTodo）

useListTodos と同じく自動フェッチだが、`useCallback` は使っていない。
その代わり `useEffect` 内で直接 `.then().catch()` を呼んでいる。

```
useEffect(() => {
  // setState → API 呼び出し → then/catch で状態更新
}, [todoId, token]);
```

`useCallback` を使わずに直接 `useEffect` に書くスタイルは、関数を外部に公開（refetch）しない場合に使える。

`setState` に関数形式（`prev =>` ）を使わず、オブジェクト直書きにしている。
最初に loading セットするとき `prev` を引き継がないのは `data` を一旦リセットしてよいから。

### コンポーネント（FindTodo）

3 パターンの条件分岐：
1. `loading` → ローディング
2. `error` → エラー表示
3. `!todo` → `null` を返す（データがまだない）
4. それ以外 → 詳細表示

`createdAt` は文字列で届く（例: `"2024-01-15T10:00:00.000Z"`）。
`new Date(todo.createdAt).toLocaleString()` で読みやすい形式に整形する。

---

## ドリル

### API 関数

```typescript
// api/todoApi.ts（findTodo 関数）

// TODO: findTodo 関数を実装する
//       GET /todos/:id を呼んで Todo を返す
export async function findTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(/* TODO: URL に todoId を埋め込む */, {
    headers: /* TODO */,
  });
  return /* TODO */;
}
```

### カスタムフック

```typescript
// hooks/useFindTodo.ts

import { useState, useEffect } from "react";
import { findTodo } from "../api/todoApi";
import type { Todo } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useFindTodo(todoId: number, token: string) {
  // TODO: State 型で useState を初期化する
  const [state, setState] = useState<State>(/* TODO */);

  useEffect(() => {
    // TODO: loading: true をセットする
    setState(/* TODO */);

    // TODO: findTodo を呼び出して .then / .catch で状態を更新する
    findTodo(todoId, token)
      .then((todo) => /* TODO: 成功時に data: todo をセット */)
      .catch((err) => {
        // TODO: エラー時に error をセットする
      });
  }, [/* TODO: 依存配列 */]);

  return state;
}
```

### コンポーネント

```tsx
// components/FindTodo.tsx

import { useFindTodo } from "../hooks/useFindTodo";

type Props = {
  todoId: number;
  token: string;
};

export function FindTodo({ todoId, token }: Props) {
  // TODO: useFindTodo から data（todo に rename）、loading、error を取り出す

  // TODO: loading なら <p>読み込み中...</p> を返す
  // TODO: error があれば <p style={{ color: "red" }}>{error}</p> を返す
  // TODO: !todo なら null を返す

  return (
    <div>
      <h2>Todo 詳細</h2>
      {/* TODO: id, title, body, createdAt（toLocaleString で整形）を表示する */}
    </div>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**API 関数**
```typescript
export async function findTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}
```

**カスタムフック**
```typescript
export function useFindTodo(todoId: number, token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    findTodo(todoId, token)
      .then((todo) => setState({ data: todo, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, loading: false, error: message });
      });
  }, [todoId, token]);

  return state;
}
```

**コンポーネント**
```tsx
export function FindTodo({ todoId, token }: Props) {
  const { data: todo, loading, error } = useFindTodo(todoId, token);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!todo) return null;

  return (
    <div>
      <h2>Todo 詳細</h2>
      <p>ID: {todo.id}</p>
      <p>タイトル: {todo.title}</p>
      <p>本文: {todo.body}</p>
      <p>作成日: {new Date(todo.createdAt).toLocaleString()}</p>
    </div>
  );
}
```

</details>
