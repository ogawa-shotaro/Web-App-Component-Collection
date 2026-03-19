# Todo CRUD 練習リポジトリ

バックエンドの「ルーティング → コントローラー → リポジトリ」パターンを
空手の型・柔道の打ち込みのように反復練習するためのリポジトリです。

---

## ディレクトリ構成

```
src/           ← 完成版（答え・リファレンス）
practice/      ← 練習用テンプレート（空欄を埋める）
```

---

## 練習の進め方

### Step 1: 答えを読んで理解する

`src/` の以下の順番で読む：

1. `types/todo.ts` — 型定義
2. `repositories/ITodoRepository.ts` — インターフェース
3. `repositories/TodoRepository.ts` — データ層（モデル）
4. `controllers/` — ビジネスロジック層
5. `routes/todos.ts` — ルーティング層

### Step 2: 練習テンプレートを埋める

`practice/` の各ディレクトリに `DRILL.md` があります。
指示に従い、**リポジトリ → コントローラー → ルーター** の順番で空欄を埋める。

### Step 3: 見ずに書けるまで繰り返す

`practice/` のファイルを削除 → 何も見ずに再作成 → `src/` と照合

---

## CRUD 練習メニュー

| # | 操作 | ディレクトリ | ミドルウェア |
|---|------|-------------|-------------|
| 01 | Create（作成） | `practice/01_create/` | authHandler + validator |
| 02 | List（一覧） | `practice/02_list/` | authHandler のみ |
| 03 | Find（詳細） | `practice/03_find/` | authHandler のみ |
| 04 | Update（更新） | `practice/04_update/` | authHandler + validator |
| 05 | Delete（削除） | `practice/05_delete/` | authHandler のみ |

---

## 技術スタック（想定）

- TypeScript
- Express
- Prisma（ORM）
- Zod（バリデーション）
- http-status-codes
