# 01 Create（新規作成）

## 全体像

```
ユーザー操作（フォーム送信）
  └─ CreateTodo コンポーネント  ← フォーム状態管理・UI 表示
       └─ useCreateTodo フック  ← API 呼び出し状態の管理
            └─ createTodo 関数  ← POST /todos
```

---

## 解説

### API 関数（createTodo）

`fetch` に `method: "POST"` を指定し、`body` に `JSON.stringify(input)` を渡す。
`getHeaders(token)` で `Content-Type` と `Authorization` ヘッダーを付ける。
レスポンスは `handleResponse<Todo>(res)` に通すだけ（共通処理に任せる）。

### カスタムフック（useCreateTodo）

非同期処理の状態（loading・data・error）を `useState` でまとめて管理する。

```
execute() を呼ぶ
  → loading: true にする
  → API 呼び出し
  → 成功: data にセット、loading: false
  → 失敗: error にメッセージをセット、loading: false
```

エラーを `catch` でキャッチした後も `throw err` で再スローしている。
これにより、コンポーネント側でも `try/catch` でエラーを受け取れる。

`return { ...state, execute }` でスプレッドして返すことで、
コンポーネントは `const { loading, error, execute } = useCreateTodo(token)` と分割代入できる。

### コンポーネント（CreateTodo）

`title` と `body` のフォーム入力値を `useState` でそれぞれ管理する。
`onChange` で `setState` を呼ぶのが React の制御コンポーネントの基本パターン。

`onSubmit` では `e.preventDefault()` でページリロードを防ぐ。
成功後にフォームをリセット（`setTitle("")`）し、`onCreated?.()` で親に通知する。

`loading` 中はボタンを `disabled` にすることで2重送信を防ぐ。

---

## ドリル

### API 関数

```typescript
// api/todoApi.ts（createTodo 関数）

// TODO: createTodo 関数を実装する
//       POST /todos に input を送信して Todo を返す
export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: /* TODO */,
    headers: /* TODO */,
    body: /* TODO: JSON.stringify を使う */,
  });
  return /* TODO: handleResponse を使う */;
}
```

### カスタムフック

```typescript
// hooks/useCreateTodo.ts

import { useState } from "react";
import { createTodo } from "../api/todoApi";
import type { Todo, TodoInput } from "../types/todo";

type State = {
  data: Todo | null;
  loading: boolean;
  error: string | null;
};

export function useCreateTodo(token: string) {
  // TODO: State 型で useState を初期化する
  //       初期値: { data: null, loading: false, error: null }
  const [state, setState] = useState<State>(/* TODO */);

  const execute = async (input: TodoInput) => {
    // TODO: loading: true, data: null, error: null をセットする
    setState(/* TODO */);
    try {
      // TODO: createTodo を呼び出して todo に代入する
      const todo = await /* TODO */;
      // TODO: 成功時: data に todo をセット、loading: false にする
      setState(/* TODO */);
      return todo;
    } catch (err) {
      // TODO: err が Error インスタンスなら message を、そうでなければ "Unknown error" を使う
      const message = /* TODO */;
      // TODO: 失敗時: error に message をセット、loading: false にする
      setState(/* TODO */);
      // TODO: err を再スローする
    }
  };

  // TODO: state をスプレッドして execute とともに返す
  return /* TODO */;
}
```

### コンポーネント

```tsx
// components/CreateTodo.tsx

import { useState } from "react";
import { useCreateTodo } from "../hooks/useCreateTodo";

type Props = {
  token: string;
  onCreated?: () => void;
};

export function CreateTodo({ token, onCreated }: Props) {
  // TODO: title と body を useState で管理する（初期値は空文字）

  // TODO: useCreateTodo から loading, error, execute を取り出す

  const handleSubmit = async (e: React.FormEvent) => {
    // TODO: デフォルトのフォーム送信を防ぐ
    e.preventDefault();
    try {
      // TODO: execute({ title, body }) を呼ぶ
      // TODO: 成功後: title と body を空文字にリセットする
      // TODO: onCreated をオプショナルチェーンで呼ぶ
    } catch {
      // error は state から表示するため catch ブロックは空でよい
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>新規作成</h2>
      <div>
        <label>タイトル</label>
        {/* TODO: value と onChange を設定する */}
        <input value={/* TODO */} onChange={/* TODO */} required />
      </div>
      <div>
        <label>本文</label>
        {/* TODO: value と onChange を設定する */}
        <textarea value={/* TODO */} onChange={/* TODO */} required />
      </div>
      {/* TODO: error があれば赤文字で表示する */}
      <button type="submit" disabled={/* TODO: loading 中は disabled */}>
        {/* TODO: loading 中は "送信中..."、それ以外は "作成" */}
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
export async function createTodo(input: TodoInput, token: string): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(res);
}
```

**カスタムフック**
```typescript
export function useCreateTodo(token: string) {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null });

  const execute = async (input: TodoInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const todo = await createTodo(input, token);
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
export function CreateTodo({ token, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { loading, error, execute } = useCreateTodo(token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute({ title, body });
      setTitle("");
      setBody("");
      onCreated?.();
    } catch {
      // error は state から表示
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>新規作成</h2>
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
        {loading ? "送信中..." : "作成"}
      </button>
    </form>
  );
}
```

</details>
