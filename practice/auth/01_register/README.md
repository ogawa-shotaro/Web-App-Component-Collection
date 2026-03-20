# ユーザー登録（POST /auth/register）

## 全体像

```
POST /auth/register
  └─ validator(registerSchema)   ← email・password の形式チェック
  └─ controller.execute()        ← 重複チェック → パスワードハッシュ → 保存
       └─ repository.findByEmail() ← メールが既存かチェック
       └─ bcrypt.hash()            ← パスワードをハッシュ化
       └─ repository.save()        ← User を DB に保存
```

---

## 解説

### なぜパスワードをそのまま保存してはいけないのか

DB が漏洩したとき、平文パスワードは即座に悪用される。
**bcrypt** でハッシュ化して保存することで、漏洩しても元のパスワードが復元できなくなる。

```
平文:        "mypassword123"
ハッシュ後:  "$2b$10$XJ8Hk7Tz..." ← 元に戻せない一方向変換
```

### bcrypt のソルトラウンド

```typescript
bcrypt.hash(password, 10)
//                    ↑ ソルトラウンド数（コスト）
```

数値が大きいほどハッシュ計算が遅くなり、総当たり攻撃（ブルートフォース）に強くなる。
`10` が現在の標準的な値。サーバーのスペックに合わせて調整する。

### 重複チェック（409 Conflict）

同じメールアドレスで登録しようとしたとき、まず `findByEmail` で存在確認する。
既に存在すれば `409 Conflict` を返す（Prisma の `P2002` でも検知できるが、明示的チェックの方が分かりやすい）。

### レスポンスにパスワードを含めない

`prisma.user.create()` の戻り値には `password`（ハッシュ）が含まれる。
これをそのままレスポンスに返すのは避ける。

```typescript
// 方法1: 分割代入で除外する
const { password, ...userWithoutPassword } = await prisma.user.create(...);
return userWithoutPassword;

// 方法2: TypeScript の Omit 型でレスポンスの型を表現する
type SafeUser = Omit<User, "password">;
```

### Prisma スキーマ（参考）

```prisma
// prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Zod スキーマ

```typescript
// schemas/authSchema.ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),       // メール形式チェック
  password: z.string().min(8),     // 最低8文字
});
```

---

## ドリル

### 型定義

```typescript
// types/user.ts

export type User = {
  id: number;
  email: string;
  password: string; // bcrypt ハッシュ
  createdAt: Date;
  updatedAt: Date;
};

// レスポンス用（パスワードを除いた型）
// TODO: Omit を使って User から password を除いた SafeUser 型を定義する
export type SafeUser = /* TODO */;

export type UserRegisterInput = {
  email: string;
  hashedPassword: string; // ハッシュ済みパスワード（コントローラーでハッシュする）
};
```

### リポジトリ

```typescript
// repositories/UserRepository.ts
import { PrismaClient } from "@prisma/client";
import { User, SafeUser, UserRegisterInput } from "../types/user";

const prisma = new PrismaClient();

export class UserRepository {
  // TODO: save メソッドを実装する
  //       prisma.user.create() で新規ユーザーを作成する
  //       戻り値は SafeUser（password を除外して返す）
  async save(input: UserRegisterInput): Promise<SafeUser> {
    const user = await prisma.user.create({
      data: {
        email: /* TODO */,
        password: /* TODO: input.hashedPassword */,
      },
    });
    // TODO: user から password を除いて返す
    //       const { password, ...safeUser } = user; の形を使う
  }

  // TODO: findByEmail メソッドを実装する
  //       prisma.user.findUnique() で email を where 条件にして検索する
  //       戻り値は User | null
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { /* TODO */ },
    });
  }
}
```

### コントローラー

```typescript
// controllers/RegisterController.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";

export class RegisterController {
  constructor(private readonly repository: UserRepository) {}

  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: req.body から email と password を取り出す

      // TODO: repository.findByEmail(email) で既存ユーザーを確認する
      //       存在する場合は 409 を返して return する
      //       メッセージ: "このメールアドレスは既に使用されています"

      // TODO: bcrypt.hash(password, 10) でパスワードをハッシュ化する

      // TODO: repository.save({ email, hashedPassword }) で保存して user に代入する

      // TODO: 201 Created で user を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// routes/auth.ts
import { Router } from "express";
import { validator } from "../middlewares/validator";
import { registerSchema } from "../schemas/authSchema";
import { UserRepository } from "../repositories/UserRepository";
import { RegisterController } from "../controllers/RegisterController";

const repository = new UserRepository();
const registerController = new RegisterController(repository);

export const authRouter = Router();

// TODO: POST / のルートを定義する
//       ミドルウェア: validator(registerSchema) → registerController.execute()
authRouter
  .route("/register")
  .post(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**型定義**
```typescript
export type SafeUser = Omit<User, "password">;
```

**リポジトリ**
```typescript
async save(input: UserRegisterInput): Promise<SafeUser> {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: input.hashedPassword,
    },
  });
  const { password, ...safeUser } = user;
  return safeUser;
}

async findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}
```

**コントローラー**
```typescript
async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const existing = await this.repository.findByEmail(email);
    if (existing) {
      res.status(409).json({ message: "このメールアドレスは既に使用されています" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.repository.save({ email, hashedPassword });

    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    next(error);
  }
}
```

**ルーター**
```typescript
authRouter
  .route("/register")
  .post(validator(registerSchema), (req, res, next) => {
    registerController.execute(req, res, next);
  });
```

</details>
