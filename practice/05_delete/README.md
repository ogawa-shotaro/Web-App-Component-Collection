# 05 Delete（削除）

## 全体像

```
DELETE /todos/:id
  └─ authHandler          ← 認証チェック
  └─ controller.execute() ← ビジネスロジック
       └─ repository.remove() ← 存在しなければ NotFoundError（P2025）
```

---

## リポジトリ

- `prisma.todo.delete()` で `id` と `userId` を where 条件にする
- エラーハンドリングは update と同じパターン（P2025 → NotFoundError）

```typescript
// src/repositories/TodoRepository.ts（remove メソッド）

async remove({ todoId, userId }: TodoDeleteParams): Promise<Todo> {
  try {
    return await prisma.todo.delete({
      where: { id: todoId, userId },
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

- `req.params.id` を `Number()` で変換して `todoId` とする（update の `id` と名前が違う点に注意）
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で削除した todo を返す

```typescript
// src/controllers/DeleteTodoController.ts

import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ITodoRepository } from "../repositories/ITodoRepository";
import { AuthenticatedRequest } from "../types/request";

export class DeleteTodoController {
  constructor(private readonly repository: ITodoRepository) {}

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const todoId = Number(req.params.id);
      const userId = req.user.id;

      const todo = await this.repository.remove({ todoId, userId });

      res.status(StatusCodes.OK).json(todo);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## ルーター（全体）

最後にルーターファイル全体を打ち込む。5つの操作すべてがここに集約される。

```typescript
// src/routes/todos.ts

import { Router } from "express";
import { authHandler } from "../middlewares/authHandler";
import { validator } from "../middlewares/validator";
import { createTodoSchema, updateTodoSchema } from "../schemas/todoSchema";
import { TodoRepository } from "../repositories/TodoRepository";
import { CreateTodoController } from "../controllers/CreateTodoController";
import { ListTodoController } from "../controllers/ListTodoController";
import { FindTodoController } from "../controllers/FindTodoController";
import { UpdateTodoController } from "../controllers/UpdateTodoController";
import { DeleteTodoController } from "../controllers/DeleteTodoController";

// 依存の組み立て
const repository = new TodoRepository();

const createController = new CreateTodoController(repository);
const listController = new ListTodoController(repository);
const findController = new FindTodoController(repository);
const updateController = new UpdateTodoController(repository);
const deleteController = new DeleteTodoController(repository);

// ルーティング
export const todoRouter = Router();

// /todos
todoRouter
  .route("/")
  .get(authHandler, (req, res, next) => {
    listController.execute(req, res, next);
  })
  .post(authHandler, validator(createTodoSchema), (req, res, next) => {
    createController.execute(req, res, next);
  });

// /todos/:id
todoRouter
  .route("/:id")
  .get(authHandler, (req, res, next) => {
    findController.execute(req, res, next);
  })
  .put(authHandler, validator(updateTodoSchema), (req, res, next) => {
    updateController.execute(req, res, next);
  })
  .delete(authHandler, (req, res, next) => {
    deleteController.execute(req, res, next);
  });
```
