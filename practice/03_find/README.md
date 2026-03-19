# 03 Find（1件取得）

## 全体像

```
GET /todos/:id
  └─ authHandler          ← 認証チェック
  └─ controller.execute() ← ビジネスロジック
       └─ repository.findById() ← 存在しなければ NotFoundError を投げる
```

---

## リポジトリ

- `prisma.todo.findUnique()` で `id` と `userId` の両方を where 条件にする
- 結果が `null` の場合は返さずに `NotFoundError` を投げる

```typescript
// src/repositories/TodoRepository.ts（findById メソッド）

async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId, userId },
  });

  if (!todo) throw new NotFoundError("Todoが見つかりませんでした");

  return todo;
}
```

---

## コントローラー

- `req.params.id` を `Number()` で変換して `todoId` とする
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で返す

```typescript
// src/controllers/FindTodoController.ts

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class FindTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const todoId = Number(req.params.id);
      const userId = req.user.id;

      const todo = await this.repository.findById({ todoId, userId });

      res.status(StatusCodes.OK).json(todo);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## ルーター

- `GET /:id` に対応
- ミドルウェアは `authHandler` のみ

```typescript
// src/routes/todos.ts（GET /:id部分）

todoRouter
  .route("/:id")
  .get(authHandler, (req, res, next) => {
    findController.execute(req, res, next);
  });
```
