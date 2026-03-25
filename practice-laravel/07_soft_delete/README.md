# 07 ソフトデリート（論理削除）

データベースからレコードを物理削除せず `deleted_at` カラムに削除日時を記録することで、復元・履歴保持を可能にする機能。

---

## セットアップ

```bash
# deleted_at カラムを追加するマイグレーションを作成
php artisan make:migration add_soft_deletes_to_products_table
```

```php
// マイグレーション
public function up(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->softDeletes(); // deleted_at TIMESTAMP NULL を追加
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->dropSoftDeletes();
    });
}
```

```php
// app/Models/Product.php
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
    // ...
}
```

---

## 削除・復元・完全削除

```php
// ソフトデリート（deleted_at に現在時刻が入る）
$product->delete();

// 復元（deleted_at を NULL に戻す）
$product->restore();

// 完全削除（物理削除）
$product->forceDelete();

// 削除済みか判定
$product->trashed(); // true / false
```

---

## 取得クエリ

```php
Product::all();                      // 削除済みを除いた通常取得（deleted_at IS NULL）
Product::withTrashed()->get();       // 削除済みも含めて全件取得
Product::onlyTrashed()->get();       // 削除済みのみ取得（deleted_at IS NOT NULL）

// 削除済みも含めて ID 検索
Product::withTrashed()->find($id);
Product::onlyTrashed()->findOrFail($id);
```

| メソッド | 取得対象 | SQL 条件 |
|---|---|---|
| `all()` / `get()` | 未削除のみ | `deleted_at IS NULL` |
| `withTrashed()->get()` | 全件 | なし |
| `onlyTrashed()->get()` | 削除済みのみ | `deleted_at IS NOT NULL` |

---

## トレイトなしの場合との比較

| 操作 | トレイトなし | トレイトあり |
|---|---|---|
| `delete()` | 物理削除 | `deleted_at` に日時を記録（論理削除） |
| `withTrashed()` | エラー | 動作する |
| `onlyTrashed()` | エラー | 動作する |
| `restore()` | エラー | 動作する |
| `forceDelete()` | エラー | 物理削除 |

---

## ルート定義

```php
Route::get('/products/trashed', [ProductController::class, 'trashed'])->name('products.trashed');
Route::patch('/products/{id}/restore', [ProductController::class, 'restore'])->name('products.restore');
Route::delete('/products/{id}/force-delete', [ProductController::class, 'forceDelete'])->name('products.forceDelete');
```

> `/products/trashed` は `/products/{id}` より **前に** 定義する。後ろに書くと `trashed` が ID として解釈される。

---

## コントローラ

```php
// 削除（ソフトデリート）
public function destroy(Product $product)
{
    $product->delete(); // SoftDeletes があれば自動的に論理削除
    return redirect()->route('products.index')->with('success', '商品を削除しました');
}

// 削除済み一覧
public function trashed()
{
    $products = Product::onlyTrashed()
        ->with('category')
        ->latest('deleted_at')
        ->paginate(10);

    return view('products.trashed', compact('products'));
}

// 復元
public function restore($id)
{
    Product::onlyTrashed()->findOrFail($id)->restore();
    return redirect()->route('products.trashed')->with('success', '商品を復元しました');
}

// 完全削除
public function forceDelete($id)
{
    Product::onlyTrashed()->findOrFail($id)->forceDelete();
    return redirect()->route('products.trashed')->with('success', '商品を完全に削除しました');
}
```

---

## ビューでの操作ボタン

```html
{{-- 復元ボタン --}}
<form action="{{ route('products.restore', $product->id) }}" method="POST">
    @csrf
    @method('PATCH')
    <button type="submit">復元</button>
</form>

{{-- 完全削除ボタン --}}
<form action="{{ route('products.forceDelete', $product->id) }}" method="POST">
    @csrf
    @method('DELETE')
    <button type="submit" onclick="return confirm('完全に削除します。よろしいですか？')">
        完全削除
    </button>
</form>

{{-- 削除日時の表示 --}}
{{ $product->deleted_at->format('Y-m-d H:i') }}
```

---

## まとめ

| 機能 | 実装 |
|---|---|
| カラム追加 | `$table->softDeletes()` |
| トレイト追加 | `use SoftDeletes` |
| 論理削除 | `$product->delete()` |
| 復元 | `$product->restore()` |
| 物理削除 | `$product->forceDelete()` |
| 削除済み取得 | `onlyTrashed()` / `withTrashed()` |
