# 04 Update（更新）

## 全体像

```
PUT /todos/:id
  └─ authHandler              ← JWT を検証して req.user.id をセット
  └─ validator(schema)        ← req.body を Zod でバリデーション
  └─ controller.execute()     ← id, userId, body を取り出す
       └─ repository.update() ← 見つからなければ NotFoundError（P2025）
```

---

## 解説

### リポジトリ（TodoRepository.update）

`prisma.todo.update()` は対象レコードが**存在しない場合に例外を投げる**。
`findUnique` のように `null` を返すのではなく、直接エラーになる点が `findById` と異なる。

Prisma が投げるエラーは `PrismaClientKnownRequestError` という型で、
`error.code` に Prisma 独自のエラーコードが入っている。

| コード | 意味 |
|---|---|
| `P2025` | 対象レコードが見つからなかった |
| `P2002` | ユニーク制約違反 |

`P2025` を検知したら `NotFoundError` に変換して投げ直す。
それ以外のエラーは `throw error` で再スローし、上位に処理を任せる。

`where: { id, userId }` で**自分の Todo だけ**を更新対象にしている点は findById と同じ。

### コントローラー（UpdateTodoController）

パスパラメータの変数名が `id`（findById や delete の `todoId` と**違う**）。
これは `TodoUpdateParams` 型の定義に合わせたもの（`id` というフィールド名）。

```typescript
// src/types/todo.ts
export type TodoUpdateParams = {
  id: number;    // ← findById は todoId なのに update は id
  userId: number;
  title: string;
  body: string;
};
```

`req.body` は `validator(updateTodoSchema)` 通過後なので、`title` と `body` が保証されている。

### ルーター

PUT は body があるため、`validator(updateTodoSchema)` が必要。
`createTodoSchema` と `updateTodoSchema` は現在同じ定義だが、
将来的に「更新時はオプションフィールドを許可する」などの差異が生まれることを想定して分けてある。

---

## ドリル

### リポジトリ

```typescript
// src/repositories/TodoRepository.ts（update メソッド）

async update({ id, userId, title, body }: TodoUpdateParams): Promise<Todo> {
  try {
    // TODO: prisma.todo.update() を呼び出す
    //       where: { id, userId }、data: { title, body }
    return await prisma.todo.update({
      where: { /* TODO */ },
      data: { /* TODO */ },
    });
  } catch (error) {
    // TODO: error が PrismaClientKnownRequestError かつ code が "P2025" なら
    //       NotFoundError を投げる
    if (
      /* TODO: instanceof チェック */ &&
      /* TODO: code チェック */
    ) {
      throw new NotFoundError("Todoが見つかりませんでした");
    }
    // TODO: それ以外は再スロー
  }
}
```

### コントローラー

```typescript
// src/controllers/UpdateTodoController.ts

export class UpdateTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して id とする（todoId ではなく id）

      // TODO: req.user.id から userId を取り出す

      // TODO: req.body から title と body を分割代入で取り出す

      // TODO: this.repository.update() を呼び出して todo に代入する

      // TODO: 200 OK で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// src/routes/todos.ts（PUT /:id 部分）

// TODO: PUT /:id のルートを定義する
//       ミドルウェア: authHandler → validator(updateTodoSchema) → controller.execute()
todoRouter
  .route("/:id")
  .put(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**リポジトリ**
```typescript
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

**コントローラー**
```typescript
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

**ルーター**
```typescript
todoRouter
  .route("/:id")
  .put(authHandler, validator(updateTodoSchema), (req, res, next) => {
    updateController.execute(req, res, next);
  });
```

</details>
