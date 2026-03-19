# 03 Find（1件取得）の打ち込み

## この操作の全体像

```
GET /todos/:id
  └─ authHandler          ← 認証チェック（バリデーションなし）
  └─ controller.execute() ← ビジネスロジック
       └─ repository.findById() ← 存在しなければ NotFoundError を投げる
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
- `prisma.todo.findUnique()` で `id` と `userId` の両方を where 条件にする
- `null` の場合は `NotFoundError` を投げる（返さない）

### コントローラー
- `req.params.id` を `Number()` に変換して `todoId` とする
- `req.user.id` から `userId` を取り出す
- `StatusCodes.OK`（200）で返す

### ルーター
- `GET /:id` に対応
- ミドルウェアは `authHandler` のみ
