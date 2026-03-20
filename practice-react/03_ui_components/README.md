# 03 汎用 UI コンポーネント（components/ui/）

ビジネスロジックを持たない、見た目だけの再利用可能なパーツ。
どのページでも使い回せるように設計する。

---

## 1. Button

### 解説

よく使われる Button コンポーネントの汎用パターン。

**loading 状態:** API 呼び出し中にボタンを `disabled` にして Spinner を表示する。
`disabled || loading` にしておくと、外から `disabled` を渡しても両方効く。

**variant:** `"primary"` と `"danger"` で色を切り替える。
削除ボタンは `variant="danger"` を使うなど、呼び出し側で意味を表現できる。

**type:** フォームの中で使うとき `type="submit"` にしないと submit が動かない。
デフォルトを `"button"` にしておくと意図しない submit を防げる。

```
<Button loading={loading}>作成</Button>
→ loading 中: [⟳ 送信中...]  disabled 状態
→ 通常時:    [作成]
```

### ドリル

```tsx
// components/ui/Button.tsx
import { Spinner } from "./Spinner";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "danger";
};

// TODO: Button コンポーネントを実装する
// ポイント:
//   - disabled は disabled || loading にする（loading 中は自動で disabled）
//   - loading 中は children の代わりに <Spinner size="sm" /> を表示する
//   - className に variant を反映する（例: `btn btn-${variant}`）
export function Button({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      type={/* TODO */}
      onClick={/* TODO */}
      disabled={/* TODO: disabled || loading */}
      className={/* TODO: `btn btn-${variant}` */}
    >
      {/* TODO: loading 中は <Spinner size="sm" />、それ以外は children */}
    </button>
  );
}
```

---

## 2. Spinner

### 解説

ローディング中を示すインジケーター。`aria-label` をつけてスクリーンリーダーにも対応する。

`size` で大きさを切り替えられるようにしておくと、Button の中に小さく表示したり、ページ全体に大きく表示したりできる。

CSS でアニメーションを実装する場合は `border` と `border-radius: 50%` で円を描き、`@keyframes spin` で回転させる。

### ドリル

```tsx
// components/ui/Spinner.tsx

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

// TODO: Spinner コンポーネントを実装する
// ポイント:
//   - className に size を反映する（例: `spinner spinner-${size}`）
//   - aria-label="読み込み中" をつける（アクセシビリティ）
//   - role="status" をつける
export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span
      className={/* TODO */}
      aria-label={/* TODO */}
      role={/* TODO */}
    />
  );
}
```

---

## 3. Pagination

### 解説

ページネーション UI の汎用コンポーネント。

```
[← 前へ]  3 / 10  [次へ →]
```

受け取るのは「現在のページ」「総ページ数」「ページ変更時のコールバック」の3つだけ。
コンポーネントはページを **変える責務** だけを持ち、**データを取得する責務** は持たない。

**境界チェック:**
- `page <= 1` のとき「前へ」を `disabled` にする
- `page >= totalPages` のとき「次へ」を `disabled` にする

**表示しない条件:**
総ページ数が 1 以下なら表示する必要がないため `null` を返す。

```tsx
// 使い方
<Pagination
  page={currentPage}
  totalPages={10}
  onPageChange={(p) => setPage(p)}
/>
```

### ドリル

```tsx
// components/ui/Pagination.tsx

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// TODO: Pagination コンポーネントを実装する
// ポイント:
//   - totalPages <= 1 なら null を返す
//   - 「前へ」ボタン: page <= 1 のとき disabled, クリックで onPageChange(page - 1)
//   - 「次へ」ボタン: page >= totalPages のとき disabled, クリックで onPageChange(page + 1)
//   - 現在位置の表示: "{page} / {totalPages}"
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  // TODO: totalPages <= 1 なら null を返す

  return (
    <div className="pagination">
      <button
        onClick={/* TODO */}
        disabled={/* TODO */}
      >
        ← 前へ
      </button>

      <span>{/* TODO: "{page} / {totalPages}" を表示 */}</span>

      <button
        onClick={/* TODO */}
        disabled={/* TODO */}
      >
        次へ →
      </button>
    </div>
  );
}
```

---

<details>
<summary>答え（確認用）</summary>

**Button**
```tsx
export function Button({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant}`}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}
```

**Spinner**
```tsx
export function Spinner({ size = "md" }: SpinnerProps) {
  return (
    <span
      className={`spinner spinner-${size}`}
      aria-label="読み込み中"
      role="status"
    />
  );
}
```

**Pagination**
```tsx
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← 前へ
      </button>

      <span>{page} / {totalPages}</span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        次へ →
      </button>
    </div>
  );
}
```

</details>
