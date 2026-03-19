# 02 List（一覧取得）

## 全体像

```
GET /todos?page=1&count=10
  └─ authHandler          ← 認証チェック
  └─ controller.execute() ← ビジネスロジック
       └─ repository.list() ← ページネーション付きで取得
```

---

## リポジトリ

- `prisma.todo.findMany()` と `prisma.todo.count()` を `Promise.all` で同時実行する
- `skip = (page - 1) * count` でオフセットを計算する
- 戻り値は `{ items, total }`

```typescript
// src/repositories/TodoRepository.ts（list メソッド）

async list({
  userId,
  page = 1,
  count = 10,
}: TodoListParams): Promise<{ items: Todo[]; total: number }> {
  const skip = (page - 1) * count;

  const [items, total] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, skip, take: count }),
    prisma.todo.count({ where: { userId } }),
  ]);

  return { items, total };
}
```

---

## コントローラー

- `req.query.page`, `req.query.count` を `Number()` に変換する
- 値が `0`（未指定）の場合は `undefined` を渡す（リポジトリのデフォルト値が使われる）
- `StatusCodes.OK`（200）で返す

```typescript
// src/controllers/ListTodoController.ts

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class ListTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const page = Number(req.query.page) || undefined;
      const count = Number(req.query.count) || undefined;

      const result = await this.repository.list({ userId, page, count });

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## ルーター

- `GET /` に対応
- ミドルウェアは `authHandler` のみ（バリデーションなし）

```typescript
// src/routes/todos.ts（GET部分）

todoRouter
  .route("/")
  .get(authHandler, (req, res, next) => {
    listController.execute(req, res, next);
  });
```
