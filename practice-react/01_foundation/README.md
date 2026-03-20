# 01 Foundation（types / constants / utils）

アプリの基盤となる3つのフォルダ。他のすべてのコードがここに依存する。

---

## types/

### 解説

TypeScript の型定義をすべて `types/` に集める。
ファイルを分けることで「この型はどこにある？」という迷いがなくなる。

フロントの `Todo` 型はバックエンドから JSON で届くため、`createdAt` / `updatedAt` が `string` になる点に注意。

```typescript
// types/todo.ts

export type Todo = {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: string;  // JSON で届くので string（バックエンドは Date 型）
  updatedAt: string;
};

export type TodoInput = {
  title: string;
  body: string;
  // userId は不要（サーバーが JWT から取得する）
};

export type TodoUpdateInput = {
  title: string;
  body: string;
};

export type TodoListParams = {
  page?: number;
  count?: number;
};

// ページネーション付きの一覧レスポンス
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
};
```

> `PaginatedResponse<T>` はジェネリック型。`PaginatedResponse<Todo>` のように使う。
> これにしておくと、Todo 以外の一覧でも同じ型が使い回せる。

### ドリル

```typescript
// types/todo.ts

// TODO: 上記の型をすべて定義する
// ポイント: PaginatedResponse<T> のジェネリック型に注意
```

---

## constants/

### 解説

変更が起きたとき1箇所だけ直せばよいように、固定値を定数として管理する。

```typescript
// constants/api.ts

export const BASE_URL = "http://localhost:3000";

// ページネーションのデフォルト値
export const DEFAULT_PAGE_SIZE = 10;
```

`BASE_URL` が複数ファイルに散らばっていると、本番環境の URL に変えるとき全ファイルを直す必要が出る。

### ドリル

```typescript
// constants/api.ts

// TODO: BASE_URL と DEFAULT_PAGE_SIZE を定義する
```

---

## utils/

### 解説

**副作用がない純粋な関数**を置く場所。`useState` や `useEffect` は使わない。

```typescript
// utils/format.ts

// ISO 文字列を "2024年1月15日 10:00" のような読みやすい形式に変換する
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
```

コンポーネントの中に `new Date(...).toLocaleString(...)` を直接書くと、
同じ処理が各コンポーネントに散らばる。`utils/` に置いて `import` すればコード重複が防げる。

### ドリル

```typescript
// utils/format.ts

// TODO: formatDate 関数を実装する
//       引数: dateStr: string
//       戻り値: "2024年1月15日 10:00" のような形式の文字列
//       new Date(dateStr).toLocaleString("ja-JP", { ... }) を使う
export function formatDate(dateStr: string): string {
  // TODO
}
```

---

<details>
<summary>答え（確認用）</summary>

**types/todo.ts**
```typescript
export type Todo = {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type TodoInput = {
  title: string;
  body: string;
};

export type TodoUpdateInput = {
  title: string;
  body: string;
};

export type TodoListParams = {
  page?: number;
  count?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
};
```

**constants/api.ts**
```typescript
export const BASE_URL = "http://localhost:3000";
export const DEFAULT_PAGE_SIZE = 10;
```

**utils/format.ts**
```typescript
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
```

</details>
