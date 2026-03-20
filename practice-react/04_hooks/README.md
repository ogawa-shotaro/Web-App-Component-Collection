# 04 カスタムフック（hooks/）

状態管理ロジックをコンポーネントから切り離す。コンポーネントは「表示」だけに集中できる。

---

## 1. useApi — 汎用 API フック

### 解説

**このフックが最も汎用的で重要。** どんな API 呼び出しにも使い回せる。

```typescript
type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
```

ポイントは `execute` がジェネリックな API 関数を **引数として受け取る** 点。

```typescript
const { data: todo, loading, execute } = useApi<Todo>();

// Todo 作成にも
await execute(() => createTodo(input, token));

// Todo 更新にも
await execute(() => updateTodo(todoId, input, token));
```

1つのフックでどんな API 操作にも使い回せるため、`useCreateTodo`, `useUpdateTodo` のような個別フックを大量に作らなくて済む。

`execute` は `useCallback` でメモ化する。`useEffect` の依存配列に入れても無限ループしない。

### ドリル

```typescript
// hooks/useApi.ts
import { useState, useCallback } from "react";

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// TODO: useApi フックを実装する
// ポイント:
//   - 型パラメータ T を使う（useApi<Todo>() のように呼ぶ）
//   - execute は「API 関数を返す関数」を引数に取る: () => Promise<T>
//     例: execute(() => createTodo(input, token))
//   - execute は useCallback でメモ化する
//   - 成功: data に結果をセット、loading: false
//   - 失敗: error にメッセージをセット、loading: false + throw err（再スロー）
export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>(
    { data: null, loading: false, error: null }
  );

  const execute = useCallback(async (apiFn: () => Promise<T>) => {
    // TODO: loading: true にする
    // TODO: apiFn() を呼び出して data にセットする
    // TODO: エラー時は error にセットして再スロー
  }, []);

  // TODO: state をスプレッドして execute とともに返す
}
```

---

## 2. usePagination — ページネーション状態管理

### 解説

ページ番号の状態管理と境界チェックをまとめたフック。

```typescript
const { page, totalPages, goToPage } = usePagination(total, 10);
```

`totalPages` の計算式: `Math.ceil(total / itemsPerPage)`
- total=25, itemsPerPage=10 → `Math.ceil(2.5)` = **3** ページ
- total=20, itemsPerPage=10 → `Math.ceil(2.0)` = **2** ページ

`goToPage` は 1〜totalPages の範囲外を無視する（ガード処理）。
Pagination コンポーネントで `disabled` にしていても、直接呼ばれた場合に備えて二重ガードにしている。

### ドリル

```typescript
// hooks/usePagination.ts
import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "../constants/api";

// TODO: usePagination フックを実装する
// 引数: total（総件数）, itemsPerPage（1ページの件数、デフォルト DEFAULT_PAGE_SIZE）
// 戻り値: { page, totalPages, goToPage }
// ポイント:
//   - totalPages = Math.ceil(total / itemsPerPage)
//   - goToPage は 1〜totalPages の範囲外なら何もしない
export function usePagination(total: number, itemsPerPage = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  // TODO: totalPages を計算する

  const goToPage = (newPage: number) => {
    // TODO: 範囲チェック後に setPage を呼ぶ
  };

  return { page, totalPages: /* TODO */, goToPage };
}
```

---

## 3. useTodoList — Todo 一覧取得フック

### 解説

`useApi` と `usePagination` を組み合わせて、ページネーション付きの Todo 一覧取得を管理する。

```
useTodoList(token)
  ├─ usePagination(total)  ← ページ番号を管理
  └─ page が変わるたびに listTodos を再実行
```

`useEffect` の依存配列に `page` を入れることで、ページが変わるたびに自動でデータ取得が走る。

```typescript
// 使い方（features コンポーネント側）
const { todos, loading, error, page, totalPages, goToPage, refetch } = useTodoList(token);
```

### ドリル

```typescript
// hooks/useTodoList.ts
import { useState, useEffect, useCallback } from "react";
import { listTodos } from "../api/todoApi";
import { usePagination } from "./usePagination";
import { DEFAULT_PAGE_SIZE } from "../constants/api";
import type { Todo } from "../types/todo";

// TODO: useTodoList フックを実装する
// 処理の流れ:
//   1. todos（Todo[]）, loading, error を useState で管理する
//   2. total を useState で管理する（初期値 0）
//   3. usePagination(total) で page, totalPages, goToPage を取得する
//   4. fetchTodos を useCallback で定義する（依存配列: [page, token]）
//      - listTodos({ page, count: DEFAULT_PAGE_SIZE }, token) を呼ぶ
//      - result.items を todos にセット、result.total を total にセット
//   5. useEffect で page が変わるたびに fetchTodos を実行する
//   6. { todos, loading, error, page, totalPages, goToPage, refetch: fetchTodos } を返す
export function useTodoList(token: string) {
  // TODO
}
```

---

<details>
<summary>答え（確認用）</summary>

**useApi**
```typescript
export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>(
    { data: null, loading: false, error: null }
  );

  const execute = useCallback(async (apiFn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
```

**usePagination**
```typescript
export function usePagination(total: number, itemsPerPage = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / itemsPerPage);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return { page, totalPages, goToPage };
}
```

**useTodoList**
```typescript
export function useTodoList(token: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { page, totalPages, goToPage } = usePagination(total);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTodos({ page, count: DEFAULT_PAGE_SIZE }, token);
      setTodos(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return { todos, loading, error, page, totalPages, goToPage, refetch: fetchTodos };
}
```

</details>
