# 05 機能コンポーネント（components/features/）

`ui/` と `hooks/` を組み合わせて、実際の機能として完結させる。
features コンポーネントは「どのフックとどの UI パーツを繋ぐか」だけを担う。

---

## 1. TodoList — ページネーション付き一覧

### 解説

```
useTodoList(token)
  └─ todos, loading, error, page, totalPages, goToPage, refetch を取得
        ↓ 渡す
  <Spinner /> または <ul>...</ul> + <Pagination />
```

コンポーネントがやること：
- `useTodoList` からデータを受け取って表示する
- loading 中は `<Spinner />`、エラーは `<p>`、正常時は一覧 + `<Pagination />`
- 再読み込みボタンで `refetch()` を呼ぶ

`formatDate` を使って `createdAt` を読みやすい日付に整形する。

### ドリル

```tsx
// components/features/TodoList.tsx
import { useTodoList } from "../../hooks/useTodoList";
import { Spinner } from "../ui/Spinner";
import { Pagination } from "../ui/Pagination";
import { formatDate } from "../../utils/format";
import { Button } from "../ui/Button";

type Props = {
  token: string;
};

// TODO: TodoList コンポーネントを実装する
// ポイント:
//   - useTodoList(token) から todos, loading, error, page, totalPages, goToPage, refetch を取得
//   - loading 中は <Spinner /> を表示
//   - error があれば <p style={{ color: "red" }}>{error}</p> を表示
//   - todos が空なら "Todoがありません" を表示
//   - 一覧は <ul><li> で表示。各 todo に id, title, body, formatDate(createdAt) を表示
//   - 一覧の下に <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
//   - 「再読み込み」ボタンで refetch を呼ぶ
export function TodoList({ token }: Props) {
  const { todos, loading, error, page, totalPages, goToPage, refetch } = useTodoList(token);

  if (/* TODO: loading */) return <Spinner />;
  if (/* TODO: error */) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Todo 一覧</h2>
        {/* TODO: 「再読み込み」ボタン（Button コンポーネントを使う） */}
      </div>

      {/* TODO: todos が空なら "Todoがありません" を表示 */}
      {todos.length === 0 ? (
        /* TODO */
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {/* TODO: title, body, formatDate(todo.createdAt) を表示 */}
            </li>
          ))}
        </ul>
      )}

      {/* TODO: Pagination コンポーネントを配置する */}
    </div>
  );
}
```

---

## 2. CreateTodoForm — 新規作成フォーム

### 解説

```
useApi<Todo>()
  └─ execute(() => createTodo(input, token))
        ↓
  フォーム（title, body）+ <Button loading={loading} />
```

`useApi` は汎用フックなので、`execute` に API 関数を渡すだけで使える。

成功後の処理（リストの再読み込みなど）は `onCreated` コールバックで親コンポーネントに委譲する。
これにより `CreateTodoForm` は「フォームを送信する責務」だけを持てる。

### ドリル

```tsx
// components/features/CreateTodoForm.tsx
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { createTodo } from "../../api/todoApi";
import { Button } from "../ui/Button";
import type { Todo } from "../../types/todo";

type Props = {
  token: string;
  onCreated?: () => void; // 作成成功後に呼ばれるコールバック
};

// TODO: CreateTodoForm コンポーネントを実装する
// ポイント:
//   - title と body を useState で管理する
//   - useApi<Todo>() から loading, error, execute を取得
//   - handleSubmit:
//       e.preventDefault()
//       execute(() => createTodo({ title, body }, token)) を呼ぶ
//       成功後: title と body をリセット、onCreated?() を呼ぶ
//   - <Button type="submit" loading={loading}> を使う
export function CreateTodoForm({ token, onCreated }: Props) {
  // TODO
}
```

---

## 3. App.tsx — 全体を組み合わせる

```tsx
// App.tsx（完成形・参考）

import { CreateTodoForm } from "./components/features/CreateTodoForm";
import { TodoList } from "./components/features/TodoList";

const TOKEN = "your-jwt-token"; // 実際はログイン後に取得

export default function App() {
  // CreateTodoForm が成功したら TodoList を再読み込みしたい
  // → TodoList の refetch を呼びたいが、App からは直接呼べない
  // → 解決策: TodoList に key を使って強制再マウント、または共通の state を持つ

  return (
    <div>
      <h1>Todo アプリ</h1>
      <CreateTodoForm token={TOKEN} onCreated={() => window.location.reload()} />
      <TodoList token={TOKEN} />
    </div>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**TodoList**
```tsx
export function TodoList({ token }: Props) {
  const { todos, loading, error, page, totalPages, goToPage, refetch } = useTodoList(token);

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Todo 一覧</h2>
        <Button onClick={refetch}>再読み込み</Button>
      </div>

      {todos.length === 0 ? (
        <p>Todoがありません</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              <strong>{todo.title}</strong>
              <p>{todo.body}</p>
              <small>{formatDate(todo.createdAt)}</small>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
```

**CreateTodoForm**
```tsx
export function CreateTodoForm({ token, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { loading, error, execute } = useApi<Todo>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute(() => createTodo({ title, body }, token));
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
      <Button type="submit" loading={loading}>作成</Button>
    </form>
  );
}
```

</details>
