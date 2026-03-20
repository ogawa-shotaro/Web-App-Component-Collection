# 05 Delete（削除）

## 全体像

```
DELETE /todos/:id
  └─ authHandler              ← JWT を検証して req.user.id をセット
  └─ controller.execute()     ← todoId と userId を取り出す
       └─ repository.remove() ← 見つからなければ NotFoundError（P2025）
```

---

## 解説

### リポジトリ（TodoRepository.remove）

`prisma.todo.delete()` も `update()` と同様に、対象レコードが存在しない場合は `P2025` を投げる。
エラーハンドリングのパターンは `update` と全く同じ。

メソッド名が `delete` ではなく `remove` なのは、TypeScript/JavaScript の `delete` 演算子と名前が衝突しないようにするため（慣例）。

引数の型 `TodoDeleteParams` は `todoId`（`id` ではない）を使う。
`update` の `id` と名前が違うのは型定義の違いによるもの。

### コントローラー（DeleteTodoController）

変数名が `todoId`（`update` の `id` と**違う**）。
`TodoDeleteParams` 型が `{ todoId: number; userId: number }` なので、それに合わせる。

削除後は `200 OK` で**削除したオブジェクト**を返す。
`204 No Content`（中身なしレスポンス）を使うスタイルもあるが、
このプロジェクトでは削除した todo を返すことで「何が消えたか」をクライアントが確認できるようにしている。

### ルーター（全体像）

削除は body がないためバリデーション不要。`authHandler` のみ。

最後に、全ルートをまとめたルーターファイルも打ち込んでみよう。

---

## ドリル

### リポジトリ

```typescript
// src/repositories/TodoRepository.ts（remove メソッド）

async remove({ todoId, userId }: TodoDeleteParams): Promise<Todo> {
  try {
    // TODO: prisma.todo.delete() を呼び出す
    //       where: { id: todoId, userId }
    return await prisma.todo.delete({
      where: { /* TODO */ },
    });
  } catch (error) {
    // TODO: update と同じエラーハンドリング（P2025 → NotFoundError）
  }
}
```

### コントローラー

```typescript
// src/controllers/DeleteTodoController.ts

export class DeleteTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して todoId とする（update の id と名前が違う）

      // TODO: req.user.id から userId を取り出す

      // TODO: this.repository.remove() を呼び出して todo に代入する

      // TODO: 200 OK で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター（DELETE 部分）

```typescript
// src/routes/todos.ts（DELETE /:id 部分）

// TODO: DELETE /:id のルートを定義する
//       ミドルウェアは authHandler のみ
todoRouter
  .route("/:id")
  .delete(/* TODO */);
```

### ルーター（全体 — 全操作まとめ打ち）

```typescript
// src/routes/todos.ts（全体）

// TODO: 必要なものをすべてインポートする
//       Router, authHandler, validator, createTodoSchema, updateTodoSchema
//       TodoRepository, 5つのコントローラー

// TODO: repository を new する

// TODO: 5つのコントローラーを new する（すべて repository を渡す）

export const todoRouter = Router();

// TODO: .route("/") に GET と POST を定義する
todoRouter
  .route("/")
  // GET  /todos       → listController（authHandler のみ）
  .get(/* TODO */)
  // POST /todos       → createController（authHandler + validator）
  .post(/* TODO */);

// TODO: .route("/:id") に GET, PUT, DELETE を定義する
todoRouter
  .route("/:id")
  // GET    /todos/:id → findController（authHandler のみ）
  .get(/* TODO */)
  // PUT    /todos/:id → updateController（authHandler + validator）
  .put(/* TODO */)
  // DELETE /todos/:id → deleteController（authHandler のみ）
  .delete(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**リポジトリ**
```typescript
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

**コントローラー**
```typescript
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

**ルーター（全体）**
```typescript
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

const repository = new TodoRepository();

const createController = new CreateTodoController(repository);
const listController = new ListTodoController(repository);
const findController = new FindTodoController(repository);
const updateController = new UpdateTodoController(repository);
const deleteController = new DeleteTodoController(repository);

export const todoRouter = Router();

todoRouter
  .route("/")
  .get(authHandler, (req, res, next) => {
    listController.execute(req, res, next);
  })
  .post(authHandler, validator(createTodoSchema), (req, res, next) => {
    createController.execute(req, res, next);
  });

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

</details>
