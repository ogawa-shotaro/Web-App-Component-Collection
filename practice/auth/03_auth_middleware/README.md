# JWT 検証ミドルウェア（authHandler 完全版）

`00_middleware` の authHandler はスタブだった。ここでは `jsonwebtoken` を使った本番レベルの実装を打ち込む。

---

## 全体像

```
リクエスト（Authorization: Bearer <JWT>）
  └─ authHandler
       ├─ ヘッダーがない / "Bearer " で始まらない → 401
       ├─ jwt.verify() が失敗（改ざん・期限切れ）  → 401
       └─ 検証成功 → req.user = { id: userId } をセットして next()
```

---

## 解説

### JWT の構造

JWT は `.` で区切られた3つの Base64 文字列からできている。

```
eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOjF9  .  SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
      ↑ ヘッダー               ↑ ペイロード           ↑ 署名
  (アルゴリズム情報)        (userId などの情報)    (秘密鍵で生成した検証用データ)
```

ペイロードは Base64 デコードすれば誰でも読める。だからこそ機密情報は入れない。
署名は秘密鍵がないと生成できないため、改ざんすると `jwt.verify` で検出される。

### jwt.verify の動作

```typescript
import * as jwt from "jsonwebtoken";

try {
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
  // payload.userId → ログイン時に jwt.sign でセットした値
} catch (err) {
  // 以下のケースで例外を投げる:
  // - 署名が不正（改ざん、または秘密鍵が違う）
  // - 有効期限切れ（expiresIn を超えた）
  // - トークンの形式が不正
}
```

`jwt.verify` は同期的に動くため `await` は不要。

### AuthenticatedRequest 型

TypeScript の標準 `Request` 型には `user` プロパティがない。
型を安全にするため、`Request` を拡張した `AuthenticatedRequest` を使う。

```typescript
// types/request.ts
import { Request } from "express";

export type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};
```

`authHandler` を通過したリクエストは必ず `req.user.id` を持つ。
コントローラーの引数型を `AuthenticatedRequest` にすることで型安全を保証できる。

### 環境変数（JWT_SECRET）

```
# .env ファイル
JWT_SECRET=your-super-secret-key-change-this-in-production
```

```typescript
process.env.JWT_SECRET!
// ! はnon-null assertion。「必ず値があると保証する」TypeScript の構文。
// 実際にはサーバー起動時に存在チェックをするとより安全。
```

秘密鍵は**長くてランダムな文字列**を使う（最低32文字以上推奨）。
本番環境ではクラウドのシークレット管理サービスで管理する。

---

## ドリル

### authHandler（本番レベル）

```typescript
// middlewares/authHandler.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/request";

// TODO: authHandler ミドルウェアを実装する
// 処理の流れ：
//   1. req.headers.authorization を取り出す
//   2. 存在しない、または "Bearer " で始まらない → 401 を返して return
//   3. "Bearer " 以降のトークン文字列を取り出す（slice(7)）
//   4. jwt.verify(token, process.env.JWT_SECRET!) でトークンを検証する
//      成功: payload を { userId: number } にキャストして req.user = { id: payload.userId } をセット
//      失敗（例外）: 401 を返す
//   5. next() を呼ぶ
export const authHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // TODO: ヘッダーがない、または "Bearer " で始まらない場合に 401 を返す

  // TODO: トークン文字列を取り出す

  try {
    // TODO: jwt.verify でトークンを検証する
    // TODO: req を AuthenticatedRequest にキャストして user をセットする
    //       (req as AuthenticatedRequest).user = { id: payload.userId };

    // TODO: next() を呼ぶ
  } catch {
    // TODO: 検証失敗時は 401 を返す
    //       メッセージ: "Invalid or expired token"
  }
};
```

### 型定義（AuthenticatedRequest）

```typescript
// types/request.ts
import { Request } from "express";

// TODO: AuthenticatedRequest 型を定義する
//       Request を拡張して user: { id: number } を追加する
export type AuthenticatedRequest = /* TODO */;
```

### アプリへの組み込み（参考）

```typescript
// app.ts
import express from "express";
import { authRouter } from "./routes/auth";
import { todoRouter } from "./routes/todos";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

// 認証不要: /auth（登録・ログイン）
app.use("/auth", authRouter);

// 認証必要: /todos（authHandler は todoRouter 内の各ルートに適用）
app.use("/todos", todoRouter);

app.use(errorHandler); // 最後
```

---

<details>
<summary>答え（確認用）</summary>

**AuthenticatedRequest**
```typescript
import { Request } from "express";

export type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};
```

**authHandler**
```typescript
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/request";

export const authHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    (req as AuthenticatedRequest).user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

</details>

---

## 登録・ログイン・認証の全体フロー（まとめ）

```
① ユーザー登録
   POST /auth/register { email, password }
     → bcrypt.hash(password, 10) でハッシュ化
     → DB に保存
     → SafeUser（パスワードなし）を返す

② ログイン
   POST /auth/login { email, password }
     → DB から email でユーザーを取得
     → bcrypt.compare() でパスワードを検証
     → jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" }) でトークン生成
     → { token } を返す

③ 認証済みリクエスト
   GET /todos（Authorization: Bearer <token>）
     → authHandler が jwt.verify() でトークンを検証
     → req.user = { id: userId } をセット
     → コントローラーで req.user.id を使う
```
