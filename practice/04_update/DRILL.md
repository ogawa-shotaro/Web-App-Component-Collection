# 04 Update（更新）の打ち込み

## この操作の全体像

```
PUT /todos/:id
  └─ authHandler          ← 認証チェック
  └─ validator(schema)    ← バリデーション
  └─ controller.execute() ← ビジネスロジック
       └─ repository.update() ← 存在しなければ NotFoundError（P2025）
```

## 練習の手順

1. `repository.ts` を埋める
2. `controller.ts` を埋める
3. `router.ts` を埋める
4. `src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### リポジトリ
- `prisma.todo.update()` で `id` と `userId` を where 条件にする
- `PrismaClientKnownRequestError` の `code === "P2025"` を NotFoundError に変換する
- それ以外のエラーは再スローする

### コントローラー
- `req.params.id` を Number に変換して `id` とする
- `req.body` から `title`, `body` を取り出す
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で返す

### ルーター
- `PUT /:id` に対応
- ミドルウェア: `authHandler` → `validator(updateTodoSchema)` → コントローラー
