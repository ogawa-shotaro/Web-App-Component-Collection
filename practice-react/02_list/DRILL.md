# 02 List（一覧取得）の打ち込み

## この操作の全体像

```
コンポーネントのマウント / 再読み込みボタン
  └─ TodoList コンポーネント   ← ループ表示・UI
       └─ useListTodos フック  ← 状態管理・自動フェッチ
            └─ listTodos 関数  ← API呼び出し（GET /todos）
```

## 練習の手順

1. `api.ts` を埋める
2. `hook.ts` を埋める
3. `component.tsx` を埋める
4. `frontend-react/src/` の答えと照合する
5. ファイルを削除して最初から書き直す

---

## ポイント

### api 関数（listTodos）
- `fetch()` で `GET /todos` を呼ぶ
- クエリパラメータ（page, count）は `URLSearchParams` で組み立てる
- ヘッダーに `Authorization: Bearer {token}` を付ける

### カスタムフック（useListTodos）
- `useEffect` でマウント時に自動フェッチする
- `useCallback` で fetch 関数をメモ化し、`useEffect` の依存配列に渡す
- `refetch` として fetch 関数を外部に公開する（再読み込みボタン用）
- state の型: `{ data: Todo[], loading: boolean, error: string | null }`

### コンポーネント（TodoList）
- loading / error / 空配列 それぞれの表示を条件分岐で書く
- `todos.map()` で一覧を `<ul><li>` で表示する
- 再読み込みボタンで `refetch()` を呼ぶ
