# 04 Update（更新）

## 全体像

```
ユーザー操作（フォーム送信）
  └─ UpdateTodo コンポーネント  ← フォーム管理・UI
       └─ useUpdateTodo フック  ← API 呼び出し状態の管理
            └─ updateTodo 関数  ← PUT /todos/:id
```

---

## 解説

### API 関数（updateTodo）

`createTodo` と同じく body が必要なので `method: "PUT"` と `body: JSON.stringify(input)` を指定する。
URL に `todoId` を埋め込む点が create との違い。

### カスタムフック（useUpdateTodo）

`useCreateTodo` と全く同じパターン。違いは `execute` の引数。
- create: `execute(input)` — 新規なので id は不要
- update: `execute(todoId, input)` — 更新対象の id が必要

### コンポーネント（UpdateTodo）

**既存の値を初期値にする**のが create との大きな違い。
`initialTitle` と `initialBody` を Props で受け取り、`useState` の初期値に使う。

```typescript
const [title, setTitle] = useState(initialTitle);
const [body, setBody] = useState(initialBody);
```

送信後は create のようなフォームリセットはせず、そのまま値を保持する。
代わりに `onUpdated?.()` を呼んで親コンポーネントに完了を通知する。

---

## ドリル

### API 関数

```typescript
// api/todoApi.ts（updateTodo 関数）

// TODO: updateTodo 関数を実装する
//       PUT /todos/:id に input を送信して更新後の Todo を返す
export async function updateTodo(
  todoId: number,
  input: TodoUpdateInput,
  token: string
): Promise<Todo> {
  const res = await fetch(/* TODO: URL に todoId を埋め込む */, {
    method: /* TODO */,
    headers: /* TODO */,
    body: /* TODO */,
  });
  return /* TODO */;
}
```

### カスタムフック

```typescript
// hooks/useUpdateTodo.ts

import { useState } from "react";
import { updateTodo } from "../api/todoApi";
import type { Todo, TodoUpdateInput } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useUpdateTodo(token: string) {
  // TODO: useState を初期化する

  // TODO: execute 関数を実装する
  //       引数: todoId: number, input: TodoUpdateInput
  //       useCreateTodo の execute と同じパターン
  const execute = async (todoId: number, input: TodoUpdateInput) => {
    /* TODO */
  };

  return /* TODO */;
}
```

### コンポーネント

```tsx
// components/UpdateTodo.tsx

import { useState } from "react";
import { useUpdateTodo } from "../hooks/useUpdateTodo";

type Props = {
  todoId: number;
  initialTitle?: string;
  initialBody?: string;
  token: string;
  onUpdated?: () => void;
};

export function UpdateTodo({ todoId, initialTitle = "", initialBody = "", token, onUpdated }: Props) {
  // TODO: title を useState で管理する（初期値は initialTitle）
  // TODO: body を useState で管理する（初期値は initialBody）

  // TODO: useUpdateTodo から loading, error, execute を取り出す

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: execute(todoId, { title, body }) を呼ぶ
      // TODO: 成功後に onUpdated をオプショナルチェーンで呼ぶ
    } catch {
      // error は state から表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>編集</h2>
      <div>
        <label>タイトル</label>
        <input value={/* TODO */} onChange={/* TODO */} required />
      </div>
      <div>
        <label>本文</label>
        <textarea value={/* TODO */} onChange={/* TODO */} required />
      </div>
      {/* TODO: error を表示する */}
      <button type="submit" disabled={/* TODO */}>
        {/* TODO: loading 中は "送信中..."、それ以外は "更新" */}
      </button>
    </form>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**API 関数**
```typescript
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
```

**カスタムフック**
```typescript
export function useUpdateTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (todoId: number, input: TodoUpdateInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await updateTodo(todoId, input, token);
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
export function UpdateTodo({ todoId, initialTitle = "", initialBody = "", token, onUpdated }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const { loading, error, execute } = useUpdateTodo(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute(todoId, { title, body });
      onUpdated?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>編集</h2>
      <div>
        <label>タイトル</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>本文</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "送信中..." : "更新"}
      </button>
    </form>
  );
}
```

</details>
