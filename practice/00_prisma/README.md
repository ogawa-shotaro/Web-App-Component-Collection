# 00 Prisma の基礎

Prisma は TypeScript 向けの ORM（Object Relational Mapper）。SQL を直接書く代わりに TypeScript のメソッドでデータベース操作ができる。

---

## ORM とは

ORM を使わない場合（生 SQL）：
```sql
SELECT * FROM todos WHERE id = 5 AND user_id = 1;
```

Prisma を使う場合（TypeScript）：
```typescript
prisma.todo.findUnique({ where: { id: 5, userId: 1 } })
```

メリット：
- **型安全** — 存在しないフィールドを指定するとコンパイルエラーになる
- **補完が効く** — フィールド名を打ち間違えない
- **SQL を書かなくていい** — DB の種類（PostgreSQL, MySQL, SQLite）が変わっても同じコードが動く

---

## PrismaClient のセットアップ

```typescript
import { PrismaClient } from "@prisma/client";

// PrismaClient のインスタンスを作る
// 1ファイルで1つだけ作り、使い回す（複数作るとコネクションが無駄になる）
const prisma = new PrismaClient();
```

`prisma.todo` は Prisma が `schema.prisma` のモデル定義から自動生成したアクセサ。
モデル名が `Todo` なら `prisma.todo`、`User` なら `prisma.user` になる（小文字スタート）。

---

## CRUD メソッド一覧

### create — レコードを1件作成

```typescript
const todo = await prisma.todo.create({
  data: {
    title: "買い物",
    body: "牛乳を買う",
    userId: 1,
  },
});
// 戻り値: 作成されたレコード（Todo 型）
```

### findMany — 複数件取得

```typescript
const todos = await prisma.todo.findMany({
  where: { userId: 1 },   // 絞り込み条件
  skip: 0,                // 先頭から何件スキップするか（ページネーション）
  take: 10,               // 何件取得するか
});
// 戻り値: Todo[] （条件に合うレコードの配列。0件なら []）
```

### count — 件数を取得

```typescript
const total = await prisma.todo.count({
  where: { userId: 1 },
});
// 戻り値: number
```

### findUnique — 1件取得（見つからなければ null）

```typescript
const todo = await prisma.todo.findUnique({
  where: { id: 5, userId: 1 }, // 複合条件も OK
});
// 戻り値: Todo | null
```

`findUnique` と `findFirst` の違い：
- `findUnique` → `where` にユニーク制約のあるフィールドが必要（`id` など）
- `findFirst` → 任意の条件で最初の1件を取得

### update — 1件更新（見つからなければ例外）

```typescript
const todo = await prisma.todo.update({
  where: { id: 5, userId: 1 },
  data: { title: "新しいタイトル" },
});
// 戻り値: 更新後のレコード（Todo 型）
// 対象が存在しない場合: P2025 エラーを throw する
```

`findUnique` と違い、`update` は**見つからなければ例外を投げる**（null を返さない）。

### delete — 1件削除（見つからなければ例外）

```typescript
const todo = await prisma.todo.delete({
  where: { id: 5, userId: 1 },
});
// 戻り値: 削除されたレコード（Todo 型）
// 対象が存在しない場合: P2025 エラーを throw する
```

---

## リレーション（connect）

外部キーを直接書くのではなく、`connect` を使って関連レコードを紐付ける。

```typescript
// userId: 1 を直接書く方法（動くが Prisma スタイルではない）
await prisma.todo.create({
  data: { title: "...", body: "...", userId: 1 },
});

// connect を使う方法（Prisma 推奨スタイル）
await prisma.todo.create({
  data: {
    title: "...",
    body: "...",
    user: { connect: { id: 1 } }, // id=1 の User レコードに紐付ける
  },
});
```

`connect` を使うと「この User が存在するか」のチェックも Prisma がしてくれる。

---

## エラーハンドリング（P2025）

`update` や `delete` は対象が見つからないとき、`PrismaClientKnownRequestError` を throw する。
`error.code` に Prisma 独自のエラーコードが入っている。

```typescript
import { Prisma } from "@prisma/client";

try {
  await prisma.todo.update({ where: { id: 999 }, data: { title: "..." } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.log(error.code); // "P2025" = 対象レコードが存在しない
  }
}
```

よく使う Prisma エラーコード：

| コード | 意味 |
|---|---|
| `P2025` | 操作対象のレコードが見つからなかった |
| `P2002` | ユニーク制約違反（メールアドレス重複など） |
| `P2003` | 外部キー制約違反（存在しない userId を指定など） |

---

## Promise.all — 複数クエリの並列実行

2つのクエリを逐次実行（遅い）：

```typescript
const items = await prisma.todo.findMany(...); // ① 終わってから
const total = await prisma.todo.count(...);    // ② 実行
// 合計時間 = ①の時間 + ②の時間
```

`Promise.all` で並列実行（速い）：

```typescript
const [items, total] = await Promise.all([
  prisma.todo.findMany(...), // ① と ② が同時に走る
  prisma.todo.count(...),
]);
// 合計時間 = max(①の時間, ②の時間)
```

互いに依存しないクエリは `Promise.all` でまとめるのが定石。

---

## ドリル

以下のメソッドをゼロから書けるようになるまで打ち込もう。

### create

```typescript
// TodoRepository の save メソッド
async save(input: TodoInput): Promise<Todo> {
  return prisma.todo.create({
    data: {
      title: /* TODO */,
      body: /* TODO */,
      user: { connect: { id: /* TODO */ } },
    },
  });
}
```

### findMany + count（Promise.all）

```typescript
// TodoRepository の list メソッド
async list({ userId, page = 1, count = 10 }: TodoListParams) {
  const skip = /* TODO: ページネーションのオフセットを計算 */;

  const [items, total] = await Promise.all([
    prisma.todo.findMany({ where: { /* TODO */ }, skip, take: /* TODO */ }),
    prisma.todo.count({ where: { /* TODO */ } }),
  ]);

  return { items, total };
}
```

### findUnique + null チェック

```typescript
// TodoRepository の findById メソッド
async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
  const todo = await prisma.todo.findUnique({
    where: { id: /* TODO */, userId: /* TODO */ },
  });

  // TODO: null なら NotFoundError を throw する

  return todo;
}
```

### update + P2025 ハンドリング

```typescript
// TodoRepository の update メソッド
async update({ id, userId, title, body }: TodoUpdateParams): Promise<Todo> {
  try {
    return await prisma.todo.update({
      where: { /* TODO */ },
      data: { /* TODO */ },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === /* TODO: レコードが存在しないエラーコード */
    ) {
      throw new NotFoundError("Todoが見つかりませんでした");
    }
    throw error;
  }
}
```

### delete + P2025 ハンドリング

```typescript
// TodoRepository の remove メソッド（update と同じパターン）
async remove({ todoId, userId }: TodoDeleteParams): Promise<Todo> {
  try {
    return await prisma.todo.delete({
      where: { id: /* TODO */, userId: /* TODO */ },
    });
  } catch (error) {
    // TODO: update と同じエラーハンドリング
  }
}
```

---

<details>
<summary>答え（確認用）</summary>

**create**
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

**findMany + count**
```typescript
async list({ userId, page = 1, count = 10 }: TodoListParams) {
  const skip = (page - 1) * count;

  const [items, total] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, skip, take: count }),
    prisma.todo.count({ where: { userId } }),
  ]);

  return { items, total };
}
```

**findUnique + null チェック**
```typescript
async findById({ todoId, userId }: TodoFindParams): Promise<Todo> {
  const todo = await prisma.todo.findUnique({
    where: { id: todoId, userId },
  });

  if (!todo) throw new NotFoundError("Todoが見つかりませんでした");

  return todo;
}
```

**update + P2025**
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

**delete + P2025**
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

</details>
