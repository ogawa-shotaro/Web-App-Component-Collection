# 04 Update（更新）

## 全体像

```
PUT /todos/:id
  └─ authHandler          ← 認証チェック
  └─ validator(schema)    ← バリデーション
  └─ controller.execute() ← ビジネスロジック
       └─ repository.update() ← 存在しなければ NotFoundError（P2025）
```

---

## リポジトリ

- `prisma.todo.update()` で `id` と `userId` を where 条件にする
- `PrismaClientKnownRequestError` の `code === "P2025"` は「対象が存在しない」エラー → `NotFoundError` に変換する
- それ以外のエラーは `throw error` で再スローする

```typescript
// src/repositories/TodoRepository.ts（update メソッド）

async update({ id, userId, title, body }: TodoUpdateParams): Promise<Todo> {
  try {
    return await prisma.todo.update({
      where: { id, userId },
      data: { title, body },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Todoが見つかりませんでした");
    }
    throw error;
  }
}
```

---

## コントローラー

- `req.params.id` を `Number()` で変換して `id` とする（delete の `todoId` と名前が違う点に注意）
- `req.body` から `title`, `body` を取り出す
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で返す

```typescript
// src/controllers/UpdateTodoController.ts

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class UpdateTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      const userId = req.user.id;
      const { title, body } = req.body;

      const todo = await this.repository.update({ id, userId, title, body });

      res.status(StatusCodes.OK).json(todo);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## ルーター

- `PUT /:id` に対応
- ミドルウェアの順番: `authHandler` → `validator(updateTodoSchema)` → コントローラー

```typescript
// src/routes/todos.ts（PUT /:id部分）

todoRouter
  .route("/:id")
  .put(authHandler, validator(updateTodoSchema), (req, res, next) => {
    updateController.execute(req, res, next);
  });
```
