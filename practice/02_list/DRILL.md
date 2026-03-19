# 02 List（一覧取得）の打ち込み

## この操作の全体像

```
GET /todos?page=1&count=10
  └─ authHandler          ← 認証チェック（バリデーションなし）
  └─ controller.execute() ← ビジネスロジック
       └─ repository.list() ← ページネーション付きで取得
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
- `prisma.todo.findMany()` + `prisma.todo.count()` を **Promise.all** で同時実行
- `skip = (page - 1) * count` でオフセット計算
- 戻り値は `{ items, total }`

### コントローラー
- クエリパラメータ `req.query.page`, `req.query.count` を Number に変換
- 存在しない場合は `undefined` を渡す（リポジトリがデフォルト値を持つ）
- `StatusCodes.OK`（200）で返す

### ルーター
- `GET /` に対応
- ミドルウェアは `authHandler` のみ（バリデーションなし）
