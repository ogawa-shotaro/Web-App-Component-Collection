# 00 フロントエンド共通セットアップ

各操作で使い回す型定義と API の共通ユーティリティを先に理解・打ち込みする。

---

## 型定義

バックエンドの型とほぼ対応するが、フロント側の `Todo` は `createdAt / updatedAt` が `string`（JSON で届く文字列）になる点が違う。

```typescript
// types/todo.ts

// ===== エンティティ =====

type Todo = {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt: string;  // バックエンドは Date 型だが、JSON 変換後は string
  updatedAt: string;
};

// ===== 各操作の入力型 =====

type TodoInput = {
  title: string;
  body: string;
  // userId は含めない（サーバー側で req.user.id から取得するため）
};

type TodoListParams = {
  page?: number;
  count?: number;
};

type TodoUpdateInput = {
  title: string;
  body: string;
};
```

> `TodoInput` に `userId` が不要な理由: フロントエンドは JWT トークンをヘッダーに載せるだけでよく、userId はバックエンドの `authHandler` が `req.user.id` として取り出す（`00_auth/README.md` 参照）。

---

## API 共通ユーティリティ

全 API 関数で使い回す共通処理を先に定義しておく。

### BASE_URL

開発環境のバックエンド URL を定数にしておく。

### getHeaders

毎回同じヘッダーを書かないよう関数にまとめる。
- `Content-Type: application/json` — リクエスト body が JSON であることを宣言
- `Authorization: Bearer <token>` — JWT トークンを送ってユーザーを認証

### handleResponse

`fetch` はネットワークエラー以外ではエラーを throw しない（404, 500 でも resolve する）。
そのため `res.ok`（ステータスが 200〜299 のとき `true`）で手動チェックが必要。
エラー時はサーバーが返した JSON の `message` を取り出してエラーにする。

---

## ドリル

```typescript
// api/todoApi.ts（共通部分）

import type { Todo, TodoInput, TodoListParams, TodoUpdateInput } from "../types/todo";

// TODO: BASE_URL を定義する（"http://localhost:3000"）
const BASE_URL = /* TODO */;

// TODO: getHeaders 関数を実装する
//       引数: token: string
//       戻り値: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
function getHeaders(token: string): HeadersInit {
  return {
    /* TODO */
  };
}

// TODO: handleResponse 関数を実装する
//       res.ok でなければエラーを throw する
//       res.ok なら res.json() を返す
async function handleResponse<T>(res: Response): Promise<T> {
  if (/* TODO: res.ok でない場合 */) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return /* TODO */;
}
```

---

<details>
<summary>答え（確認用）</summary>

```typescript
const BASE_URL = "http://localhost:3000";

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

</details>
