# 00 React アプリのディレクトリ構成

## 推奨構成（React + TypeScript + Vite）

```
src/
├── types/               ← 型定義（TypeScript の型をここで一元管理）
├── constants/           ← 定数（API URL、デフォルト値など）
├── utils/               ← ユーティリティ関数（日付整形など）
├── api/                 ← サーバーとの通信（fetch 関数）
├── hooks/               ← カスタムフック（状態管理ロジック）
└── components/
    ├── ui/              ← 汎用 UI コンポーネント（Button, Spinner, Pagination）
    └── features/        ← 機能コンポーネント（TodoList, CreateTodoForm）
```

---

## 各フォルダの役割と依存関係

```
types/       ← 全フォルダから参照される（依存なし）
constants/   ← api/ や hooks/ から参照される（types に依存）
utils/       ← どこからでも使える小さな関数（types に依存）
api/         ← サーバーと話す層（types, constants に依存）
hooks/       ← 状態管理（api, types に依存）
components/
  ui/        ← 再利用可能な見た目のパーツ（types のみ依存）
  features/  ← 機能として完結したコンポーネント（hooks, ui に依存）
```

**依存の方向は常に上から下**（features が types を直接参照するのは OK、逆は NG）。

---

## 何をどこに置くか

| 例 | 置き場所 | 理由 |
|---|---|---|
| `Todo` 型、`TodoInput` 型 | `types/` | アプリ全体で使う型定義 |
| `BASE_URL = "http://localhost:3000"` | `constants/` | 変更が1箇所で済む |
| `formatDate(dateStr)` | `utils/` | 純粋関数、どこでも使える |
| `createTodo(input, token)` | `api/` | サーバーとの通信処理 |
| `useApi()`, `usePagination()` | `hooks/` | `useState` / `useEffect` を含むロジック |
| `<Button>`, `<Spinner>`, `<Pagination>` | `components/ui/` | 見た目だけの汎用パーツ |
| `<TodoList>`, `<CreateTodoForm>` | `components/features/` | ビジネスロジックを持つ機能パーツ |

---

## Atomic Design との対応

参照記事でよく使われる Atomic Design との対応関係：

| Atomic Design | このプロジェクトの対応 | 例 |
|---|---|---|
| Atoms | `components/ui/` | Button, Spinner, Input |
| Molecules | `components/ui/` or `components/features/` | Pagination, TodoCard |
| Organisms | `components/features/` | TodoList, CreateTodoForm |
| Templates / Pages | `App.tsx` or `pages/` | 全体レイアウト |

小規模なら `ui/` と `features/` の2層で十分。大規模になったら Atomic Design の厳密な分類を使う。

---

## このリポジトリでの練習順序

```
01_foundation  → types/, constants/, utils/ を先に固める
      ↓
02_api         → api/ 層でサーバーとの通信を実装
      ↓
03_ui_components → components/ui/ で汎用パーツを作る
      ↓
04_hooks       → hooks/ で状態管理ロジックを作る
      ↓
05_features    → components/features/ で全体を組み合わせる
```
