# 01 Create（新規作成）の打ち込み

## この操作の全体像

```
ユーザー操作（フォーム送信）
  └─ CreateTodo コンポーネント  ← イベント処理・UI表示
       └─ useCreateTodo フック  ← 状態管理・ビジネスロジック
            └─ createTodo 関数  ← API呼び出し（POST /todos）
```

## 練習の手順

1. `api.ts` を埋める
2. `hook.ts` を埋める
3. `component.tsx` を埋める
4. `frontend-react/src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### api 関数（todoApi.ts の createTodo）
- `fetch()` で `POST /todos` を呼ぶ
- ヘッダーに `Authorization: Bearer {token}` を付ける
- `Content-Type: application/json` を付けて `body` に JSON を渡す
- `res.ok` でエラーチェック → `res.json()` で Todo を返す

### カスタムフック（useCreateTodo）
- `useState` で `{ data, loading, error }` を管理する
- `execute` 関数: loading を true にして api を呼び出し、結果を state に反映する
- エラー時は `error` に message を入れる

### コンポーネント（CreateTodo）
- `useState` でフォームの入力値（title, body）を管理する
- `onSubmit` で `execute({ title, body })` を呼ぶ
- `loading` 中はボタンを `disabled` にする
- `error` があれば表示する
