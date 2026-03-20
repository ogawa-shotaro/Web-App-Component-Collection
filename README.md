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

### CRUD ドリル

| # | 内容 | ミドルウェア |
|---|------|-------------|
| [01_create](./practice/01_create/README.md) | POST /todos（新規作成） | authHandler + validator |
| [02_list](./practice/02_list/README.md) | GET /todos（一覧・ページネーション） | authHandler のみ |
| [03_find](./practice/03_find/README.md) | GET /todos/:id（1件取得） | authHandler のみ |
| [04_update](./practice/04_update/README.md) | PUT /todos/:id（更新） | authHandler + validator |
| [05_delete](./practice/05_delete/README.md) | DELETE /todos/:id（削除） | authHandler のみ |

### 技術スタック

- TypeScript / Express / Prisma / Zod / http-status-codes

---

## フロントエンド練習メニュー（`practice-react/`）

パターン: `コンポーネント → フック → API 関数`

バックエンドの各層に対応している：

| バックエンド | フロントエンド | 役割 |
|---|---|---|
| `repositories/` | `api/` | データ取得層（DB / fetch） |
| `controllers/` | `hooks/` | 状態管理・ビジネスロジック |
| `routes/` | `components/` | UI・イベント処理 |

| # | 内容 | 実装するもの |
|---|------|-------------|
| [00_setup](./practice-react/00_setup/README.md) | 型定義・API共通ユーティリティ | types / getHeaders / handleResponse |
| [01_create](./practice-react/01_create/README.md) | POST /todos（新規作成） | api + hook + component |
| [02_list](./practice-react/02_list/README.md) | GET /todos（一覧） | api + hook + component |
| [03_find](./practice-react/03_find/README.md) | GET /todos/:id（1件取得） | api + hook + component |
| [04_update](./practice-react/04_update/README.md) | PUT /todos/:id（更新） | api + hook + component |
| [05_delete](./practice-react/05_delete/README.md) | DELETE /todos/:id（削除） | api + hook + component |

### 技術スタック

- React 18+ / TypeScript / Fetch API
