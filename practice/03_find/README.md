# 03 Find（1件取得）

## 全体像

```
GET /todos/:id
  └─ authHandler               ← JWT を検証して req.user.id をセット
  └─ controller.execute()      ← todoId と userId を取り出す
       └─ repository.findById() ← 見つからなければ NotFoundError を投げる
```

---

## 解説

### リポジトリ（TodoRepository.findById）

`prisma.todo.findUnique()` は `where` 条件に一致するレコードを1件返す。存在しない場合は `null`。

`where` に `id` だけでなく `userId` も含める理由：
他のユーザーの Todo の `id` を指定されても取得できないようにするため（認可の実装）。
`{ id: todoId, userId }` の両方が一致するレコードだけが取得対象になる。

`null` のときは値を返さず、**例外を投げる（throw）** のがポイント。
呼び出し元（コントローラー）は `catch` でそれを受け取り、`next(error)` でエラーハンドラーに渡す。
`NotFoundError` には `statusCode = 404` が設定されており、エラーハンドラーが適切なレスポンスを返す。

### コントローラー（FindTodoController）

URLパスパラメータ（`req.params`）も**文字列**で届く。
`req.params.id` は `"5"` のような文字列なので、`Number()` で数値に変換する。

`req.user.id` は authHandler がセットした値（`00_auth/README.md` 参照）。

### ルーター

`GET /:id` の `:id` がパスパラメータ。
`/todos/5` にアクセスすると `req.params.id === "5"` になる。
バリデーションは不要（body がないため）。

---

## ドリル

### リポジトリ

```typescript
// src/repositories/TodoRepository.ts（findById メソッド）

async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
  // TODO: prisma.todo.findUnique() で id と userId の両方を where 条件にして取得する
  const todo = await prisma.todo.findUnique({
    where: { /* TODO */ },
  });

  // TODO: todo が null なら NotFoundError を投げる
  //       new NotFoundError("Todoが見つかりませんでした")

  // TODO: todo を返す
}
```

### コントローラー

```typescript
// src/controllers/FindTodoController.ts

export class FindTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.params.id を Number に変換して todoId とする

      // TODO: req.user.id から userId を取り出す

      // TODO: this.repository.findById() を呼び出して todo に代入する

      // TODO: 200 OK で todo を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// src/routes/todos.ts（GET /:id 部分）

// TODO: GET /:id のルートを定義する
//       ミドルウェアは authHandler のみ
todoRouter
  .route("/:id")
  .get(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**リポジトリ**
```typescript
async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId, userId },
  });

  if (!todo) throw new NotFoundError("Todoが見つかりませんでした");

  return todo;
}
```

**コントローラー**
```typescript
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

**ルーター**
```typescript
todoRouter
  .route("/:id")
  .get(authHandler, (req, res, next) => {
    findController.execute(req, res, next);
  });
```

</details>
