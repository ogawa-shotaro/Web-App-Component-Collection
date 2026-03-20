# 00 ミドルウェア

Express のミドルウェアパターンを4種類打ち込む。どれも汎用的でほぼすべての Express アプリで使われるパターン。

---

## ミドルウェアとは

**リクエストとレスポンスの間に挟まる処理**のこと。
シグネチャは常に `(req, res, next) => void`。

```
クライアント → [MW1] → [MW2] → [MW3] → レスポンス
                next()  next()  res.json()
```

ミドルウェアの中で `next()` を呼ぶと次に進み、`res.json()` などを呼ぶとそこで終了する。

```typescript
// ミドルウェアの基本形
import { Request, Response, NextFunction } from "express";

const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 前処理（認証・ログ・バリデーションなど）

  next(); // 次のミドルウェアへ

  // next() の代わりに res.json() を返せば、そこでパイプラインが止まる
};
```

---

## 1. ロガーミドルウェア

すべてのリクエストをログに記録する。`app.use()` でアプリ全体に適用するのが一般的。

### 解説

`app.use(logger)` のように登録すると、**全リクエストで最初に実行される**。
`req.method`（GET, POST...）と `req.url`（/todos/5...）を組み合わせてログを出す。
ログを出したら必ず `next()` で次に進む。

### ドリル

```typescript
// middlewares/logger.ts
import { Request, Response, NextFunction } from "express";

// TODO: logger ミドルウェアを実装する
//       [2024-01-15T10:00:00.000Z] GET /todos のようなログを console.log で出力する
//       出力後は next() で次に進む
export const logger = (req: Request, res: Response, next: NextFunction) => {
  // TODO
};
```

<details>
<summary>答え（確認用）</summary>

```typescript
export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
```

</details>

---

## 2. 認証ミドルウェア（authHandler）

`Authorization: Bearer <token>` ヘッダーを検証してユーザー情報を `req.user` にセットする。

### 解説

**ヘッダーの確認:**
`req.headers.authorization` の値は `"Bearer eyJhbGci..."` のような文字列。
`startsWith("Bearer ")` でプレフィックスを確認し、`slice(7)` でトークン部分だけ取り出す（`"Bearer "` は7文字）。

**JWT の検証（本番）:**
`jsonwebtoken` ライブラリの `jwt.verify(token, SECRET)` でトークンを検証・デコードする。
デコード結果からユーザー情報（userId など）を取り出して `req.user` にセットする。

**認証失敗時:**
`next()` を呼ばずに `res.status(401).json(...)` で返す。
これ以降のミドルウェアやコントローラーには到達しない。

**型の拡張:**
標準の `Request` 型には `user` プロパティがないため、型を拡張する必要がある。

```typescript
// Express の Request 型に user プロパティを追加する方法
// （このプロジェクトでは AuthenticatedRequest 型で対応している）
declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}
```

### ドリル

```typescript
// middlewares/authHandler.ts
import { Request, Response, NextFunction } from "express";

// TODO: authHandler ミドルウェアを実装する
// 処理の流れ：
//   1. req.headers.authorization を取り出す
//   2. "Bearer " で始まっていない場合は 401 を返す
//   3. "Bearer " を除いたトークン文字列を取り出す（slice を使う）
//   4. ※本番: jwt.verify() でトークンを検証してデコード
//   5. req.user = { id: デコードしたuserId } をセットする
//   6. next() を呼ぶ
export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // TODO: authHeader が存在しない、または "Bearer " で始まらない場合に 401 を返す

  // TODO: "Bearer " の後ろのトークン文字列を取り出す

  // ↓ 本番ではここで jwt.verify(token, process.env.JWT_SECRET) を呼ぶ
  // const payload = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };

  // TODO: req.user = { id: /* デコードした userId */ } をセットする（練習用は固定値でよい）

  // TODO: next() を呼ぶ
};
```

<details>
<summary>答え（確認用）</summary>

```typescript
export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7); // "Bearer ".length === 7

  // 本番: const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
  // 練習用スタブ: userId を固定値にする
  (req as any).user = { id: 1 };

  next();
};
```

</details>

---

## 3. バリデーターミドルウェア（validator）

**ミドルウェアを返す関数**（ミドルウェアファクトリー）。Zod スキーマで `req.body` を検証する。

### 解説

通常のミドルウェアは関数1つだが、バリデーターは**関数を返す関数**になっている。

```typescript
validator(createTodoSchema)
// → (req, res, next) => { ... } という関数を返す
```

なぜファクトリーにするのか：
`validator` を呼ぶときにスキーマを渡せるようにするため。
これにより1つの関数で任意のスキーマに対応できる。

`schema.safeParse(req.body)` はバリデーションを実行して `{ success, data, error }` を返す。
- 成功: `result.data` に型が付いた安全な値が入る → `req.body` を上書きして `next()`
- 失敗: `result.error.flatten()` でエラーを整形して 400 を返す

### ドリル

```typescript
// middlewares/validator.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// TODO: validator 関数を実装する
// validator はミドルウェアを返す関数（ミドルウェアファクトリー）
// 処理の流れ：
//   1. schema.safeParse(req.body) でバリデーションを実行する
//   2. 失敗（!result.success）なら 400 を返す
//      エラーの内容: result.error.flatten()
//   3. 成功なら req.body を result.data で上書きして next() を呼ぶ
export const validator =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    // TODO
  };
```

<details>
<summary>答え（確認用）</summary>

```typescript
export const validator =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
```

</details>

---

## 4. エラーハンドラーミドルウェア

Express のエラーハンドラーは引数が **4つ**（`err, req, res, next`）。これが3つのミドルウェアと区別する仕組み。

### 解説

コントローラーで `next(error)` を呼ぶと、通常のミドルウェア（3引数）をスキップして、エラーハンドラー（4引数）に直接ジャンプする。

```
[controller]  next(error)
     ↓          ↓ 通常のミドルウェアをスキップ
[errorHandler]  ← err を受け取る（4引数）
```

`err.statusCode` を見てステータスコードを決める。
自作エラー（`NotFoundError` など）は `statusCode` プロパティを持っているのでそれを使う。
持っていない予期せぬエラーは `500` にする。

エラーハンドラーは `app.use(errorHandler)` を**最後に**登録する必要がある（全ルートより後）。

### ドリル

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

// TODO: errorHandler ミドルウェアを実装する
// 引数が 4つ（err が先頭）であることが重要。これで Express がエラーハンドラーと認識する。
// 処理の流れ：
//   1. err.statusCode があればそれを使い、なければ 500 にする
//   2. res.status(statusCode).json({ message: err.message }) で返す
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO
};
```

<details>
<summary>答え（確認用）</summary>

```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err as any).statusCode ?? 500;
  res.status(statusCode).json({ message: err.message });
};
```

</details>

---

## アプリへの登録順序

```typescript
// app.ts（登録順序のまとめ）
import express from "express";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { todoRouter } from "./routes/todos";

const app = express();

app.use(express.json());   // req.body を JSON として解析（最初に必要）
app.use(logger);           // 全リクエストをログに記録

app.use("/todos", todoRouter); // ルーター（authHandler・validator はルーター内で使う）

app.use(errorHandler);     // エラーハンドラーは必ず最後
```

| ミドルウェア | 登録場所 | タイミング |
|---|---|---|
| `express.json()` | `app.use` | 最初（body を解析するため） |
| `logger` | `app.use` | 全リクエスト共通 |
| `authHandler` | 各ルート | 認証が必要なルートのみ |
| `validator(schema)` | 各ルート | body のあるルート（POST/PUT）のみ |
| `errorHandler` | `app.use` | 最後（全ルートより後） |
