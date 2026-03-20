# 05 Delete（削除）

## 全体像

```
ユーザー操作（削除ボタンクリック）
  └─ DeleteTodo コンポーネント  ← 確認ダイアログ・UI
       └─ useDeleteTodo フック  ← API 呼び出し状態の管理
            └─ deleteTodo 関数  ← DELETE /todos/:id
```

---

## 解説

### API 関数（deleteTodo）

`method: "DELETE"` を指定する。body は不要なので `JSON.stringify` も不要。
ヘッダーに認証情報だけ付ける。

delete と update の違い：

| | update | delete |
|---|---|---|
| method | `"PUT"` | `"DELETE"` |
| body | あり（JSON） | なし |
| Content-Type | 必要 | 不要（getHeaders で自動付与されるが問題はない） |

### カスタムフック（useDeleteTodo）

`useCreateTodo` / `useUpdateTodo` と同じパターン。
`execute(todoId)` の引数は id のみ（input は不要）。

### コンポーネント（DeleteTodo）

削除は取り消しできない操作なので `window.confirm()` で確認ダイアログを出す。

```typescript
if (!window.confirm("削除しますか？")) return;  // キャンセルなら early return
```

ボタンを赤色にして視覚的に「危険な操作」であることを示す。

フォームではなくボタン単体のコンポーネントなので `onSubmit` ではなく `onClick` を使う。

---

## ドリル

### API 関数

```typescript
// api/todoApi.ts（deleteTodo 関数）

// TODO: deleteTodo 関数を実装する
//       DELETE /todos/:id を呼んで削除した Todo を返す
export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(/* TODO: URL に todoId を埋め込む */, {
    method: /* TODO */,
    headers: /* TODO */,
    // body は不要
  });
  return /* TODO */;
}
```

### カスタムフック

```typescript
// hooks/useDeleteTodo.ts

import { useState } from "react";
import { deleteTodo } from "../api/todoApi";
import type { Todo } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useDeleteTodo(token: string) {
  // TODO: useState を初期化する

  // TODO: execute 関数を実装する
  //       引数: todoId: number のみ（input は不要）
  //       useCreateTodo の execute と同じパターン
  const execute = async (todoId: number) => {
    /* TODO */
  };

  return /* TODO */;
}
```

### コンポーネント

```tsx
// components/DeleteTodo.tsx

import { useDeleteTodo } from "../hooks/useDeleteTodo";

type Props = {
  todoId: number;
  token: string;
  onDeleted?: () => void;
};

export function DeleteTodo({ todoId, token, onDeleted }: Props) {
  // TODO: useDeleteTodo から loading, error, execute を取り出す

  const handleDelete = async () => {
    // TODO: window.confirm で確認する。キャンセルなら return する
    if (!window.confirm(/* TODO */)) return;
    try {
      // TODO: execute(todoId) を呼ぶ
      // TODO: 成功後に onDeleted をオプショナルチェーンで呼ぶ
    } catch {
      // error は state から表示
    }
  };

  return (
    <div>
      {/* TODO: error を表示する */}
      <button
        onClick={handleDelete}
        disabled={/* TODO */}
        style={{ color: "red" }}
      >
        {/* TODO: loading 中は "削除中..."、それ以外は "削除" */}
      </button>
    </div>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**API 関数**
```typescript
export async function deleteTodo(todoId: number, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse<Todo>(res);
}
```

**カスタムフック**
```typescript
export function useDeleteTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (todoId: number) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await deleteTodo(todoId, token);
      setState({ data: todo, loading: false, error: null });
      return todo;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  };

  return { ...state, execute };
}
```

**コンポーネント**
```tsx
export function DeleteTodo({ todoId, token, onDeleted }: Props) {
  const { loading, error, execute } = useDeleteTodo(token);

  const handleDelete = async () => {
    if (!window.confirm("削除しますか？")) return;
    try {
      await execute(todoId);
      onDeleted?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleDelete} disabled={loading} style={{ color: "red" }}>
        {loading ? "削除中..." : "削除"}
      </button>
    </div>
  );
}
```

</details>
