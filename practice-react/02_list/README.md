# 02 List（一覧取得）

## 全体像

```
コンポーネントのマウント / 再読み込みボタン
  └─ TodoList コンポーネント   ← ループ表示・UI
       └─ useListTodos フック  ← 自動フェッチ・状態管理
            └─ listTodos 関数  ← GET /todos?page=1&count=10
```

---

## 解説

### API 関数（listTodos）

クエリパラメータを URL に手動で組み立てるには `URLSearchParams` を使う。

```typescript
const query = new URLSearchParams();
if (params.page) query.set("page", String(params.page));
// → "page=1&count=10" のような文字列が作られる
```

`fetch` の URL に `?${query.toString()}` を末尾に付けて GET リクエストを送る。
GET は body がないため `method` の指定は不要（デフォルトが GET）。

### カスタムフック（useListTodos）

useCreateTodo（手動 execute）と違い、**マウント時に自動でフェッチ**するのが特徴。
`useEffect` でマウント時（＆依存値が変わるたび）に fetch を実行する。

`useCallback` で fetch 関数をメモ化する理由：
- `useEffect` の依存配列に関数を入れると、毎レンダーで新しい関数が生成され無限ループになる
- `useCallback` を使うと、依存値（token, page, count）が変わったときだけ関数が再生成される

`refetch` として fetch 関数を公開することで、再読み込みボタンから呼び出せる。

state の初期値は `{ data: [], loading: false, error: null }`（`data` が配列）。
create の `data: null` とは違う点に注意。

### コンポーネント（TodoList）

3 パターンの条件分岐：
1. `loading` が `true` → ローディング表示
2. `error` がある → エラー表示
3. それ以外 → 一覧表示（`todos.length === 0` の場合は「Todoがありません」）

---

## ドリル

### API 関数

```typescript
// api/todoApi.ts（listTodos 関数）

// TODO: listTodos 関数を実装する
//       GET /todos にクエリパラメータを付けてリクエストする
export async function listTodos(params: TodoListParams, token: string): Promise<Todo[]> {
  // TODO: URLSearchParams を使ってクエリ文字列を組み立てる
  //       params.page があれば "page" を追加
  //       params.count があれば "count" を追加
  const query = new URLSearchParams();
  /* TODO */

  const res = await fetch(`${BASE_URL}/todos?${query.toString()}`, {
    headers: /* TODO */,
  });
  return /* TODO */;
}
```

### カスタムフック

```typescript
// hooks/useListTodos.ts

import { useState, useEffect, useCallback } from "react";
import { listTodos } from "../api/todoApi";
import type { Todo, TodoListParams } from "../types/todo";

type State = {
  data: Todo[];
  loading: boolean;
  error: string | null;
};

export function useListTodos(params: TodoListParams, token: string) {
  // TODO: State 型で useState を初期化する（data の初期値は [] ）
  const [state, setState] = useState<State>(/* TODO */);

  // TODO: useCallback で fetch 関数をメモ化する
  //       依存配列: [token, params.page, params.count]
  const fetch = useCallback(async () => {
    // TODO: loading: true にする（data と error は prev から引き継ぐ）
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: listTodos を呼び出して todos に代入する
      // TODO: 成功時: data に todos をセット、loading: false にする
    } catch (err) {
      // TODO: エラー時: data を []、loading: false、error にメッセージをセットする
    }
  }, [/* TODO: 依存配列 */]);

  // TODO: useEffect で fetch を実行する（依存配列: [fetch]）

  // TODO: state をスプレッドして refetch として fetch を返す
  return /* TODO */;
}
```

### コンポーネント

```tsx
// components/TodoList.tsx

import { useListTodos } from "../hooks/useListTodos";

type Props = {
  token: string;
  onSelect?: (id: number) => void;
};

export function TodoList({ token, onSelect }: Props) {
  // TODO: useListTodos から data（todos に rename）、loading、error、refetch を取り出す

  // TODO: loading 中は <p>読み込み中...</p> を返す
  // TODO: error があれば <p style={{ color: "red" }}>{error}</p> を返す

  return (
    <div>
      <h2>Todo 一覧</h2>
      {/* TODO: 再読み込みボタン（クリックで refetch を呼ぶ） */}
      {/* TODO: todos.length === 0 なら "Todoがありません"、それ以外は ul>li で一覧表示 */}
      {/*       li クリックで onSelect?.(todo.id) を呼ぶ */}
    </div>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**API 関数**
```typescript
export async function listTodos(params: TodoListParams, token: string): Promise<Todo[]> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.count) query.set("count", String(params.count));

  const res = await fetch(`${BASE_URL}/todos?${query.toString()}`, {
    headers: getHeaders(token),
  });
  return handleResponse<Todo[]>(res);
}
```

**カスタムフック**
```typescript
export function useListTodos(params: TodoListParams, token: string) {
  const [state, setState] = useState<State>({ data: [], loading: false, error: null });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const todos = await listTodos(params, token);
      setState({ data: todos, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: [], loading: false, error: message });
    }
  }, [token, params.page, params.count]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}
```

**コンポーネント**
```tsx
export function TodoList({ token, onSelect }: Props) {
  const { data: todos, loading, error, refetch } = useListTodos({}, token);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Todo 一覧</h2>
      <button onClick={refetch}>再読み込み</button>
      {todos.length === 0 ? (
        <p>Todoがありません</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} onClick={() => onSelect?.(todo.id)} style={{ cursor: "pointer" }}>
              <strong>{todo.title}</strong> — {todo.body}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

</details>
