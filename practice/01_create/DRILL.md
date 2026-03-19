# 01 Create（新規作成）の打ち込み

## この操作の全体像

```
POST /todos
  └─ authHandler          ← 認証チェック
  └─ validator(schema)    ← バリデーション
  └─ controller.execute() ← ビジネスロジック
       └─ repository.save() ← DB保存
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
- `prisma.todo.create()` でレコードを作成
- `user: { connect: { id: ... } }` でリレーションを繋ぐ

### コントローラー
- `req.body` から `title`, `body` を取り出す
- `req.user.id` から `userId` を取り出す
- `repository.save()` に渡す
- `StatusCodes.CREATED`（201）を返す

### ルーター
- `POST /` に対応
- ミドルウェアの順番: `authHandler` → `validator(createTodoSchema)` → コントローラー
