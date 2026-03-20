# ログイン（POST /auth/login）

## 全体像

```
POST /auth/login
  └─ validator(loginSchema)     ← email・password の形式チェック
  └─ controller.execute()       ← ユーザー検索 → パスワード検証 → JWT 発行
       └─ repository.findByEmail() ← email でユーザーを検索
       └─ bcrypt.compare()         ← パスワードを検証
       └─ jwt.sign()               ← JWT トークンを生成
```

---

## 解説

### bcrypt.compare の仕組み

登録時にハッシュ化したパスワードと、入力されたパスワードを比較する。

```typescript
await bcrypt.compare("入力されたパスワード", "$2b$10$保存されたハッシュ...")
// → true（一致）または false（不一致）
```

内部的にはハッシュ内のソルト情報を取り出し、同じ条件でハッシュ計算して比較している。
元のパスワードを復元しているわけではない。

### なぜ「メールが違う」と「パスワードが違う」を同じエラーにするのか

```typescript
// 悪い例（情報を漏らしている）
if (!user) {
  res.status(404).json({ message: "ユーザーが存在しません" }); // ← メールの存在がバレる
}
if (!isValid) {
  res.status(401).json({ message: "パスワードが違います" });
}

// 良い例（どちらも同じメッセージ）
res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
```

「メールが存在する」という情報だけで、攻撃者はそのアカウントをターゲットにできる。
どちらの場合も `401` で同じメッセージを返すのがセキュリティの基本。

### jwt.sign の3つの引数

```typescript
jwt.sign(
  { userId: user.id },         // ① ペイロード: トークンに埋め込む情報
  process.env.JWT_SECRET!,     // ② 秘密鍵: サーバーだけが知る文字列
  { expiresIn: "7d" }          // ③ オプション: 有効期限
)
```

**ペイロード** には最小限の情報だけ入れる（`userId` のみが理想）。
パスワードや機密情報は絶対に入れない（Base64 デコードすれば誰でも見られる）。

**秘密鍵** は環境変数で管理する（`.env` ファイル）。
ソースコードにハードコードしてはいけない。

**有効期限** の単位:

| 文字列 | 意味 |
|---|---|
| `"1h"` | 1時間 |
| `"7d"` | 7日間 |
| `"30d"` | 30日間 |
| `3600` | 3600秒（数値で秒指定も可） |

### jwt.verify との関係

```
jwt.sign()   → トークンを生成（ログイン時）
jwt.verify() → トークンを検証・デコード（リクエスト毎に authHandler が実行）
```

`sign` と `verify` は同じ秘密鍵を使う。秘密鍵が違うと `verify` は例外を投げる。

### Zod スキーマ

```typescript
// schemas/authSchema.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // ログイン時はバリデーションを緩くする
});
```

ログイン時のパスワードバリデーションは `min(1)`（空でなければOK）にする。
登録時の `min(8)` をログイン時にも適用すると、将来パスワードポリシーを変えたとき古いユーザーがログインできなくなる。

---

## ドリル

### コントローラー

```typescript
// controllers/LoginController.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";

export class LoginController {
  constructor(private readonly repository: UserRepository) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: req.body から email と password を取り出す

      // TODO: repository.findByEmail(email) でユーザーを検索する
      //       見つからない場合は 401 を返して return する
      //       メッセージ: "メールアドレスまたはパスワードが違います"

      // TODO: bcrypt.compare(password, user.password) でパスワードを検証する
      //       一致しない場合は 401 を返して return する（メッセージは同じ）

      // TODO: jwt.sign() で JWT トークンを生成する
      //       ペイロード: { userId: user.id }
      //       秘密鍵: process.env.JWT_SECRET!
      //       オプション: { expiresIn: "7d" }

      // TODO: 200 OK で { token } を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// routes/auth.ts（login 部分を追加）
import { LoginController } from "../controllers/LoginController";
import { loginSchema } from "../schemas/authSchema";

const loginController = new LoginController(repository);

// TODO: POST /login のルートを定義する
//       ミドルウェア: validator(loginSchema) → loginController.execute()
authRouter
  .route("/login")
  .post(/* TODO */);
```

### ルーター全体（register + login）

```typescript
// routes/auth.ts（全体）
import { Router } from "express";
import { validator } from "../middlewares/validator";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { UserRepository } from "../repositories/UserRepository";
import { RegisterController } from "../controllers/RegisterController";
import { LoginController } from "../controllers/LoginController";

// TODO: repository, registerController, loginController を初期化する

export const authRouter = Router();

// TODO: POST /register と POST /login のルートを定義する

// app.ts での登録（参考）
// app.use("/auth", authRouter);
// → POST /auth/register
// → POST /auth/login
```

---

<details>
<summary>答え（確認用）</summary>

**コントローラー**
```typescript
async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await this.repository.findByEmail(email);
    if (!user) {
      res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "メールアドレスまたはパスワードが違います" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    next(error);
  }
}
```

**ルーター全体**
```typescript
import { Router } from "express";
import { validator } from "../middlewares/validator";
import { registerSchema, loginSchema } from "../schemas/authSchema";
import { UserRepository } from "../repositories/UserRepository";
import { RegisterController } from "../controllers/RegisterController";
import { LoginController } from "../controllers/LoginController";

const repository = new UserRepository();
const registerController = new RegisterController(repository);
const loginController = new LoginController(repository);

export const authRouter = Router();

authRouter
  .route("/register")
  .post(validator(registerSchema), (req, res, next) => {
    registerController.execute(req, res, next);
  });

authRouter
  .route("/login")
  .post(validator(loginSchema), (req, res, next) => {
    loginController.execute(req, res, next);
  });
```

</details>
