# 00 Express の基礎

Express を使う上で必ず登場する `req`・`res`・`next`・`Router` の意味と、メソッドチェーンの仕組みを理解する。

---

## req（リクエストオブジェクト）

クライアントから届いた HTTP リクエストの情報がすべて入っているオブジェクト。

```
GET /todos/5?page=2
Authorization: Bearer xxxxx
Body: { "title": "買い物" }
```

上のリクエストが届いたとき、各プロパティは以下の値になる：

| プロパティ | 値 | 説明 |
|---|---|---|
| `req.method` | `"GET"` | HTTP メソッド |
| `req.url` | `"/todos/5?page=2"` | パス + クエリ文字列 |
| `req.path` | `"/todos/5"` | パス部分のみ |
| `req.params.id` | `"5"` | `:id` のようなパスパラメータ（**常に文字列**） |
| `req.query.page` | `"2"` | `?page=2` のようなクエリパラメータ（**常に文字列**） |
| `req.body` | `{ title: "買い物" }` | リクエストボディ（JSON は事前に `express.json()` が必要） |
| `req.headers.authorization` | `"Bearer xxxxx"` | リクエストヘッダー |

> `req.params` も `req.query` も値は**必ず文字列**。数値として使いたい場合は `Number()` で変換が必要。

---

## res（レスポンスオブジェクト）

サーバーからクライアントへ返す HTTP レスポンスを操作するオブジェクト。

```typescript
// ステータスコードと JSON を返す（最もよく使う）
res.status(201).json({ id: 1, title: "買い物" });

// ステータスなしで JSON を返す（デフォルトは 200）
res.json({ message: "ok" });

// テキストを返す
res.send("hello");

// ステータスだけ返す（body なし）
res.sendStatus(204);
```

`res.status()` は `res` 自身を返すため、`.json()` をそのまま続けて書ける（メソッドチェーン）。

> `res.json()` や `res.send()` を呼んだあとは、同じリクエストに対してレスポンスを**2回送ってはいけない**。エラーの原因になる。

---

## next（NextFunction）

「次の処理に進む」ための関数。3つの使い方がある。

```typescript
// 1. 通常: 次のミドルウェアまたはルートハンドラーへ進む
next();

// 2. エラー: エラーハンドラーミドルウェアへジャンプする
next(new Error("something went wrong"));

// 3. （あまり使わない）同じルートの次のハンドラーへ進む
next("route");
```

コントローラーで `catch(error) { next(error) }` と書くと、エラーが Express のエラーハンドラーに渡される。

---

## ミドルウェアのパイプライン

Express のリクエスト処理は**ミドルウェアの連鎖（パイプライン）**で動いている。
各ミドルウェアは `next()` を呼ぶことで次のミドルウェアに処理を渡す。

```
リクエスト
  │
  ▼
[logger]       → next() で次へ
  │
  ▼
[authHandler]  → next() で次へ（または 401 を返して終了）
  │
  ▼
[validator]    → next() で次へ（または 400 を返して終了）
  │
  ▼
[controller]   → res.json() でレスポンスを返して終了
```

`next()` を呼ばず `res.json()` などで返すと、そこで処理が止まる。

---

## Router（ルーター）

`express.Router()` は **Express のミニアプリ**。関連するルートをひとつのファイルにまとめるために使う。

```typescript
// routes/todos.ts
import { Router } from "express";
export const todoRouter = Router();

todoRouter.get("/", handler);      // GET /
todoRouter.post("/", handler);     // POST /
todoRouter.get("/:id", handler);   // GET /:id
```

```typescript
// app.ts（エントリーポイント）
import { todoRouter } from "./routes/todos";
app.use("/todos", todoRouter);
// → todoRouter の "/" は実際は "/todos" になる
// → todoRouter の "/:id" は実際は "/todos/:id" になる
```

Router を使うと、ルートのプレフィックス（`/todos`）を1箇所だけ書けば済む。

---

## メソッドチェーン（`.route().get().post()`）

なぜ `.` で繋げて書けるのか。

`.route(path)` は `Route` オブジェクトを返す。
`Route` オブジェクトの `.get()`, `.post()` などは、**設定を追加して同じ `Route` オブジェクトを返す**。

```typescript
todoRouter
  .route("/")        // Route オブジェクトを返す
  .get(handler)      // GET を登録して → 同じ Route オブジェクトを返す
  .post(handler);    // POST を登録して → 同じ Route オブジェクトを返す
```

これは以下と全く同じ意味：

```typescript
// チェーンを使わない書き方（同等）
todoRouter.get("/", handler);
todoRouter.post("/", handler);
```

チェーンを使うメリット：
- 同じパス（`"/"`）を2回書かなくて済む
- 同じパスに対する操作がひとまとまりに見える

---

## まとめ

| 名前 | 何者か | 主な用途 |
|---|---|---|
| `req` | リクエスト情報の入れ物 | params, query, body, headers を取り出す |
| `res` | レスポンスを送る道具 | status + json でクライアントに返す |
| `next` | 次へ進む関数 | 通常は `next()`、エラー時は `next(error)` |
| `Router` | ルートをまとめるミニアプリ | 機能ごとにファイルを分ける |
| `.route().get()` | メソッドチェーン | 同じパスに複数メソッドをまとめて書く |
