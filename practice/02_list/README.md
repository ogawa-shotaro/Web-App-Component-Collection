# 02 List（一覧取得）

## 全体像

```
GET /todos?page=1&count=10
  └─ authHandler             ← JWT を検証して req.user.id をセット
  └─ controller.execute()    ← userId + クエリパラメータを取り出す
       └─ repository.list()  ← ページネーション付きで取得
```

---

## 解説

### リポジトリ（TodoRepository.list）

一覧取得では「件数（items）」と「総件数（total）」の両方が必要なことが多い。
2つを別々に `await` すると直列実行になり遅くなるため、`Promise.all` で**並列実行**する。

```
Promise.all([findMany(), count()])
  → 2つのクエリが同時に走る → どちらか遅い方が終わったら完了
```

ページネーションのオフセット計算：
- `page=1` のとき `skip = 0`（最初から）
- `page=2` のとき `skip = count`（count 件分スキップ）
- 式: `skip = (page - 1) * count`

引数に `page = 1, count = 10` のようにデフォルト値を設定しておくと、
コントローラーから `undefined` を渡してもデフォルトが使われる。

### コントローラー（ListTodoController）

クエリパラメータ（`req.query`）は**すべて文字列**として届く。
`req.query.page` は `"1"` （数値ではなく文字列の `"1"`）なので、`Number()` で変換が必要。

`Number("")` や `Number(undefined)` は `0` になる。
`0` はページ番号として不正な値なので `|| undefined` でフォールバックさせ、
リポジトリのデフォルト値（`page=1, count=10`）が使われるようにする。

バリデーションミドルウェアがないため、不正な値（例: `page=-1`）の防御はリポジトリのデフォルト値に依存している。

### ルーター

GET は一覧取得なので body がなく、バリデーションミドルウェアは不要。
`authHandler` だけで十分。

---

## ドリル

### リポジトリ

```typescript
// src/repositories/TodoRepository.ts（list メソッド）

async list({
  userId,
  page = /* TODO: デフォルト値 */,
  count = /* TODO: デフォルト値 */,
}: TodoListParams): Promise<{ items: Todo[]; total: number }> {

  // TODO: skip を計算する（ページネーションのオフセット）
  const skip = /* TODO */;

  // TODO: Promise.all で findMany と count を並列実行する
  const [items, total] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, skip, take: /* TODO */ }),
    prisma.todo.count({ where: { userId } }),
  ]);

  // TODO: { items, total } を返す
}
```

### コントローラー

```typescript
// src/controllers/ListTodoController.ts

export class ListTodoController {
  // TODO: コンストラクタを書く

  async execute(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: req.user.id から userId を取り出す

      // TODO: req.query.page を Number に変換する（0 なら undefined にする）
      const page = /* TODO */;

      // TODO: req.query.count を Number に変換する（0 なら undefined にする）
      const count = /* TODO */;

      // TODO: this.repository.list() を呼び出して result に代入する

      // TODO: 200 OK で result を返す
    } catch (error) {
      // TODO: エラーを next に渡す
    }
  }
}
```

### ルーター

```typescript
// src/routes/todos.ts（GET / 部分）

// TODO: GET / のルートを定義する
//       ミドルウェアは authHandler のみ
todoRouter
  .route("/")
  .get(/* TODO */);
```

---

<details>
<summary>答え（確認用）</summary>

**リポジトリ**
```typescript
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

**コントローラー**
```typescript
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

**ルーター**
```typescript
todoRouter
  .route("/")
  .get(authHandler, (req, res, next) => {
    listController.execute(req, res, next);
  });
```

</details>
