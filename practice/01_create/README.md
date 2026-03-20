# 01 Create（新規作成）

## 全体像

```
POST /todos
  └─ authHandler             ← JWT を検証して req.user.id をセット
  └─ validator(schema)       ← req.body を Zod でバリデーション
  └─ controller.execute()    ← userId + body を取り出してリポジトリを呼ぶ
       └─ repository.save()  ← Prisma で DB にレコードを作成
```

---

## 解説

### リポジトリ（TodoRepository.save）

`prisma.todo.create()` は Prisma の新規作成メソッド。`data` オブジェクトに保存したいフィールドを渡す。

`userId` を直接フィールドに書くのではなく、`user: { connect: { id: userId } }` という形でリレーションを繋ぐのが Prisma のスタイル。
これは「userId を持つ User レコードに紐付けて作成する」という意味。

### コントローラー（CreateTodoController）

`req.body` は `validator` ミドルウェアを通過した後なので、Zod のスキーマで検証済みの値が入っている。

`userId` は `req.user.id` から取得する。`req.user` は `authHandler` がセットした値で、型は `AuthenticatedRequest` で保証されている（`00_auth/README.md` 参照）。

処理が成功したら `StatusCodes.CREATED`（= `201`）を返す。
`200` ではなく `201` を使うのは、HTTP の慣例として「リソースが新規作成された」ことを示すため。

### バリデーション（Zod スキーマ）

```typescript
// src/schemas/todoSchema.ts
export const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
});
```

`validator(createTodoSchema)` はこのスキーマで `req.body` を検証するミドルウェアを返す。
バリデーション失敗時は `400` を返してコントローラーには到達しない。

### ルーター

ミドルウェアは **左から右の順番で実行される**。
`authHandler` → `validator(createTodoSchema)` → `controller.execute()` の順で並べる。

---

## ドリル

それぞれのファイルを自分でタイピングしよう。

### リポジトリ

```typescript
// src/repositories/TodoRepository.ts（save メソッド）

async save(input: TodoInput): Promise<Todo> {
  return prisma.todo.create({
    data: {
      title: /* TODO: input から取り出す */,
      body: /* TODO: input から取り出す */,
      user: { connect: { id: /* TODO: input から取り出す */ } },
    },
  });
}
```

### コントローラー

```typescript
// src/controllers/CreateTodoController.ts

export class CreateTodoController {
  // TODO: コンストラクタを書く
  //       private readonly repository: ITodoRepository を受け取る

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.body から title と body を分割代入で取り出す

      // TODO: req.user.id から userId を取り出す

      // TODO: this.repository.save() を呼び出して todo に代入する

      // TODO: 201 Created で todo を JSON レスポンスとして返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// src/routes/todos.ts（POST 部分）

// TODO: POST / のルートを定義する
//       ミドルウェア: authHandler → validator(createTodoSchema) → controller.execute()
todoRouter
  .route("/")
  .post(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**リポジトリ**
```typescript
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

**コントローラー**
```typescript
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

**ルーター**
```typescript
todoRouter
  .route("/")
  .post(authHandler, validator(createTodoSchema), (req, res, next) => {
    createController.execute(req, res, next);
  });
```

</details>
