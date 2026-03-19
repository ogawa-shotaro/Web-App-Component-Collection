# 04 Update（更新）の打ち込み

## この操作の全体像

```
ユーザー操作（フォーム送信）
  └─ UpdateTodo コンポーネント  ← フォーム管理・UI
       └─ useUpdateTodo フック  ← 状態管理・ビジネスロジック
            └─ updateTodo 関数  ← API呼び出し（PUT /todos/:id）
```

## 練習の手順

1. `api.ts` を埋める
2. `hook.ts` を埋める
3. `component.tsx` を埋める
4. `frontend-react/src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### api 関数（updateTodo）
- `fetch()` で `PUT /todos/:id` を呼ぶ
- URL に `todoId` を埋め込む
- ヘッダーに `Authorization: Bearer {token}` + `Content-Type: application/json` を付ける
- `body` に `JSON.stringify(input)` を渡す

### カスタムフック（useUpdateTodo）
- useCreateTodo と同じパターン（execute を返す）
- `execute(todoId, input)` の引数に注意（id も受け取る）

### コンポーネント（UpdateTodo）
- `initialTitle`, `initialBody` を Props で受け取り、useState の初期値にする
- 送信後に `onUpdated?()` を呼ぶ
