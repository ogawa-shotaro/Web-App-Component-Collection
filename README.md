# Todo CRUD 練習リポジトリ

バックエンド・フロントエンドの CRUD パターンを、解説を読みながらタイピングして身につけるためのリポジトリです。

---

## ディレクトリ構成

```
practice/          ← バックエンド練習（Express + Prisma）
practice-react/    ← フロントエンド練習（React + Fetch API）
```

---

## 練習の進め方

各ディレクトリに `README.md` が1ファイルあります。

1. **解説を読む** — 「なぜそう書くのか」まで理解する
2. **ドリルを打ち込む** — TODO を埋めながら自分でタイピングする
3. **`<details>` で答え合わせ** — 確認したら閉じる
4. **見ずに書けるまで繰り返す** — README を閉じて最初から書き直す

---

## バックエンド練習メニュー（`practice/`）

パターン: `ルーター → コントローラー → リポジトリ`

### 基礎知識（先に読む）

| ファイル | 内容 |
|---|---|
| [00_express](./practice/00_express/README.md) | req / res / next / Router / メソッドチェーンの仕組み |
| [00_middleware](./practice/00_middleware/README.md) | ミドルウェアの概念・logger / authHandler / validator / errorHandler のドリル |
| [00_auth](./practice/00_auth/README.md) | JWT・userId の取得フロー（authHandler の背景） |
| [00_prisma](./practice/00_prisma/README.md) | Prisma の基礎・CRUD メソッド・エラーコード・Promise.all |

### 認証ドリル（`practice/auth/`）

| # | 内容 | ライブラリ |
|---|------|-----------|
| [01_register](./practice/auth/01_register/README.md) | POST /auth/register（ユーザー登録・bcrypt ハッシュ） | bcrypt + Prisma |
| [02_login](./practice/auth/02_login/README.md) | POST /auth/login（パスワード検証・JWT 発行） | bcrypt + jsonwebtoken |
| [03_auth_middleware](./practice/auth/03_auth_middleware/README.md) | JWT 検証ミドルウェア完全版・全体フロー | jsonwebtoken |

### CRUD ドリル

| # | 内容 | ミドルウェア |
|---|------|-------------|
| [01_create](./practice/01_create/README.md) | POST /todos（新規作成） | authHandler + validator |
| [02_list](./practice/02_list/README.md) | GET /todos（一覧・ページネーション） | authHandler のみ |
| [03_find](./practice/03_find/README.md) | GET /todos/:id（1件取得） | authHandler のみ |
| [04_update](./practice/04_update/README.md) | PUT /todos/:id（更新） | authHandler + validator |
| [05_delete](./practice/05_delete/README.md) | DELETE /todos/:id（削除） | authHandler のみ |

### 技術スタック

- TypeScript / Express / Prisma / Zod / bcrypt / jsonwebtoken / http-status-codes

---

## フロントエンド練習メニュー（`practice-react/`）

構成: `types/ → constants/ → utils/ → api/ → hooks/ → components/`

| バックエンド | フロントエンド | 役割 |
|---|---|---|
| `repositories/` | `api/` | データ取得層（DB / fetch） |
| `controllers/` | `hooks/` | 状態管理・ビジネスロジック |
| `routes/` | `components/features/` | 機能コンポーネント |
| — | `components/ui/` | 汎用 UI パーツ（Button, Spinner, Pagination） |

| # | 内容 | 学ぶこと |
|---|------|---------|
| [00_structure](./practice-react/00_structure/README.md) | ディレクトリ構成の解説 | 何をどこに置くかの考え方 |
| [01_foundation](./practice-react/01_foundation/README.md) | types / constants / utils | 型・定数・ユーティリティ関数 |
| [02_api](./practice-react/02_api/README.md) | api/ 層 | fetch + エラーハンドリングパターン |
| [03_ui_components](./practice-react/03_ui_components/README.md) | components/ui/ | Button / Spinner / Pagination |
| [04_hooks](./practice-react/04_hooks/README.md) | hooks/ | 汎用 useApi / usePagination / useTodoList |
| [05_features](./practice-react/05_features/README.md) | components/features/ | TodoList + CreateTodoForm（全体を組み合わせる） |

### 技術スタック

- React 18+ / TypeScript / Fetch API（Vite 想定）
