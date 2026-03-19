# 01 Create（新規作成）

## 全体像

```
POST /todos
  └─ authHandler          ← 認証チェック
  └─ validator(schema)    ← バリデーション
  └─ controller.execute() ← ビジネスロジック
       └─ repository.save() ← DB保存
```

---

## リポジトリ

- `prisma.todo.create()` でレコードを作成する
- `data` に `title`, `body`, `user: { connect: { id: userId } }` を渡す

```typescript
// src/repositories/TodoRepository.ts（save メソッド）

async save(input: TodoInput): Promise<Todo> {
  return prisma.todo.create({
    data: {
      title: input.title,
      body: input.body,
      user: { connect: { id: input.userId } },
    },
  });
}
```

---

## コントローラー

- `req.body` から `title`, `body` を取り出す
- `req.user.id` から `userId` を取り出す
- `repository.save()` に渡して `todo` を受け取る
- `StatusCodes.CREATED`（201）で返す

```typescript
// src/controllers/CreateTodoController.ts

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class CreateTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, body } = req.body;
      const userId = req.user.id;

      const todo = await this.repository.save({ title, body, userId });

      res.status(StatusCodes.CREATED).json(todo);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## ルーター

- `POST /` に対応
- ミドルウェアの順番: `authHandler` → `validator(createTodoSchema)` → コントローラー

```typescript
// src/routes/todos.ts（POST部分）

todoRouter
  .route("/")
  .post(authHandler, validator(createTodoSchema), (req, res, next) => {
    createController.execute(req, res, next);
  });
```
