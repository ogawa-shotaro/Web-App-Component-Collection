# 05 Delete（削除）の打ち込み

## この操作の全体像

```
DELETE /todos/:id
  └─ authHandler          ← 認証チェック（バリデーションなし）
  └─ controller.execute() ← ビジネスロジック
       └─ repository.remove() ← 存在しなければ NotFoundError（P2025）
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
- `prisma.todo.delete()` で `id` と `userId` を where 条件にする
- `PrismaClientKnownRequestError` の `code === "P2025"` を NotFoundError に変換する
- update と同じエラーハンドリングパターン

### コントローラー
- `req.params.id` を Number に変換して `todoId` とする（update の `id` と名前が違う点に注意）
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で削除したtodoを返す

### ルーター
- `DELETE /:id` に対応
- ミドルウェアは `authHandler` のみ（バリデーションなし）
