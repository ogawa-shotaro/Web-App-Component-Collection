# 03 Find（1件取得）の打ち込み

## この操作の全体像

```
コンポーネントのマウント（todoId が変わるたびに再フェッチ）
  └─ FindTodo コンポーネント  ← 詳細表示・UI
       └─ useFindTodo フック  ← 状態管理・自動フェッチ
            └─ findTodo 関数  ← API呼び出し（GET /todos/:id）
```

## 練習の手順

1. `api.ts` を埋める
2. `hook.ts` を埋める
3. `component.tsx` を埋める
4. `frontend-react/src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### api 関数（findTodo）
- `fetch()` で `GET /todos/:id` を呼ぶ
- URL に `todoId` を埋め込む
- ヘッダーに `Authorization: Bearer {token}` を付ける

### カスタムフック（useFindTodo）
- `useEffect` で `todoId` か `token` が変わるたびに自動フェッチ
- `.then().catch()` でも `async/await` でも実装できる
- state の型: `{ data: Todo | null, loading: boolean, error: string | null }`

### コンポーネント（FindTodo）
- loading / error / data なし の 3パターンを条件分岐で表示
- todo の各フィールドを表示する
- `createdAt` は `new Date().toLocaleString()` で整形するとよい
