# 00 認証と userId の流れ

このプロジェクトの全操作に共通する「userId はどこから来るのか」を理解する。

---

## userId 取得の全体像

```
クライアント
  │  Authorization: Bearer <JWT トークン>
  ▼
authHandler（ミドルウェア）
  │  JWT を検証 → req.user = { id: userId } をセット
  ▼
コントローラー
  │  const userId = req.user.id  ← ここで取り出す
  ▼
リポジトリ
     where: { userId }  ← 自分のデータだけ操作する
```

---

## 1. JWT とは

**JWT（JSON Web Token）** はユーザーの認証情報を安全に運ぶトークン。

- ユーザーがログインすると、サーバーが JWT を発行してクライアントに返す
- JWT の中には `{ userId: 42 }` のような情報が含まれている
- クライアントはその後のリクエストで `Authorization: Bearer <JWT>` ヘッダーに入れて送る
- サーバー側で JWT を検証すれば「このリクエストは userId=42 のユーザーからだ」とわかる

JWT はサーバー側の秘密鍵で署名されているため、改ざんされていても検証で弾ける。

---

## 2. authHandler ミドルウェア

```typescript
// src/middlewares/authHandler.ts
export const authHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 実際はここで JWT を検証する：
  //   1. Authorization ヘッダーからトークンを取り出す
  //   2. jwt.verify(token, SECRET_KEY) でトークンを検証・デコード
  //   3. デコード結果から userId を取り出す
  //   4. req.user = { id: userId } をセットする
  //   5. 不正なトークンなら 401 を返して next() を呼ばない
  next();
};
```

> このプロジェクトでは練習用のスタブのため、JWT 検証は省略されている。

---

## 3. AuthenticatedRequest 型

Express の標準 `Request` には `user` プロパティがない。
そのため `AuthenticatedRequest` という拡張型を定義して型安全にしている。

```typescript
// src/types/request.ts
export type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};
```

`authHandler` を通過したリクエストは必ず `req.user.id` を持つ。
コントローラーの引数を `AuthenticatedRequest` にすることで、型チェックが通る。

---

## 4. なぜ userId を where 条件に入れるのか

```typescript
// userId を where 条件に含めることで「自分のデータだけ」に限定できる
prisma.todo.findUnique({
  where: { id: todoId, userId },  // ← userId が一致しないと取得できない
});
```

`id` だけで検索すると、他のユーザーの Todo も取得・更新・削除できてしまう。
`userId` を必ず組み合わせることで **認可（Authorization）** を実現している。

---

## まとめ

| 場所 | 役割 |
|---|---|
| JWT（クライアントが送る） | 「私は userId=42 です」という証明書 |
| `authHandler` | JWT を検証して `req.user.id` にセット |
| `AuthenticatedRequest` | `req.user.id` を型として保証 |
| コントローラー | `req.user.id` を取り出してリポジトリに渡す |
| リポジトリ | `where: { userId }` で自分のデータだけを操作 |
