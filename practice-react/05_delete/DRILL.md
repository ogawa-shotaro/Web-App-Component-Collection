# 05 Delete（削除）の打ち込み

## この操作の全体像

```
ユーザー操作（削除ボタンクリック）
  └─ DeleteTodo コンポーネント  ← 確認ダイアログ・UI
       └─ useDeleteTodo フック  ← 状態管理・ビジネスロジック
            └─ deleteTodo 関数  ← API呼び出し（DELETE /todos/:id）
```

## 練習の手順

1. `api.ts` を埋める
2. `hook.ts` を埋める
3. `component.tsx` を埋める
4. `frontend-react/src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### api 関数（deleteTodo）
- `fetch()` で `DELETE /todos/:id` を呼ぶ
- method は `"DELETE"`（body は不要）
- ヘッダーに `Authorization: Bearer {token}` を付ける

### カスタムフック（useDeleteTodo）
- useCreateTodo と同じパターン（execute を返す）
- `execute(todoId)` の引数は id のみ

### コンポーネント（DeleteTodo）
- ボタンクリック時に `window.confirm()` で確認ダイアログを出す
- キャンセルされたら early return する
- 削除成功後に `onDeleted?()` を呼ぶ
- ボタンのスタイルを赤にして視覚的に危険操作と分かるようにする
