# 04 モデル（Model）

データベースのテーブルをPHPクラスとして操作する Eloquent ORM の使い方を理解する。

---

## モデルの作成

```bash
php artisan make:model Product          # モデルのみ
php artisan make:model Product -m       # モデル + マイグレーション
php artisan make:model Product --resource  # モデル + マイグレーション + コントローラ
```

```php
// app/Models/Product.php
class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'price', 'stock', 'is_published', 'category_id',
    ];
}
```

> `$fillable` を設定しないと `create()` で `MassAssignmentException` が出る。ホワイトリスト方式でセキュリティを担保する。

---

## CRUD 操作

```php
// 取得
Product::all();                          // 全件
Product::find(1);                        // ID で1件（なければ null）
Product::where('price', '>', 10000)->get(); // 条件で複数件
Product::where('price', '>', 10000)->first(); // 条件で最初の1件
Product::count();                        // 件数

// 作成
$product = Product::create([
    'name'  => 'ノートPC',
    'price' => 120000,
]);

// 更新
$product->price = 98000;
$product->save();
// または
$product->update(['price' => 98000]);

// 削除
$product->delete();
```

---

## 終端メソッド

メソッドチェーン中はSQLが発行されず、終端メソッドを呼んだ時点で実行される。

```php
// SQL 未実行（クエリを組み立て中）
$query = Product::where('price', '>', 10000)
    ->where('is_published', true)
    ->orderBy('created_at', 'desc');

// ここで初めて SQL 実行
$products = $query->get();
```

| 終端メソッド | 戻り値 |
|---|---|
| `get()` | コレクション（複数件） |
| `first()` | 1件 or null |
| `find($id)` | 1件 or null |
| `count()` | 件数（整数） |
| `pluck('name')` | 特定カラムの配列 |
| `exists()` | true / false |
| `sum('price')` / `avg()` / `max()` / `min()` | 集計値 |

```php
// デバッグ: 発行される SQL を確認
$query->toSql();       // "select * from `products` where `price` > ?"
$query->getBindings(); // [10000]
```

---

## :: と -> の使い分け

| 記号 | 使い場面 | 例 |
|---|---|---|
| `::` | 新たに検索・作成するとき | `Product::find(1)` |
| `->` | 取得済みオブジェクトを操作するとき | `$product->name` |

---

## リレーション

### 1対多（hasMany / belongsTo）

```php
// Category（親）
public function products()
{
    return $this->hasMany(Product::class);
}

// Product（子・外部キーを持つ側）
public function category()
{
    return $this->belongsTo(Category::class);
}
```

```php
$product->category->name;   // 商品 → カテゴリー
$category->products;        // カテゴリー → 商品一覧
```

> **外部キーを持つ側が `belongsTo()`** と覚える。

### 1対1（hasOne / belongsTo）

```php
// Product（外部キーを持たない側）
public function detail()
{
    return $this->hasOne(ProductDetail::class);
}

// ProductDetail（外部キーを持つ側）
public function product()
{
    return $this->belongsTo(Product::class);
}
```

```php
$product->detail?->manufacturer; // detail が null の場合に備え ?-> を使う
```

### 多対多（belongsToMany）

中間テーブル（ピボットテーブル）が必要。命名規則はアルファベット順・単数形・アンダースコア区切り（例: `product_tag`）。

```php
// Product
public function tags()
{
    return $this->belongsToMany(Tag::class);
}

// Tag
public function products()
{
    return $this->belongsToMany(Product::class);
}
```

```php
$product->tags;                     // 商品 → タグ一覧
$tag->products;                     // タグ → 商品一覧

$product->tags()->attach($tagId);   // タグを追加（既存は保持）
$product->tags()->detach($tagId);   // タグを削除
$product->tags()->sync([1, 3]);     // 指定IDだけにする（それ以外は削除）
$product->tags()->syncWithoutDetaching([2]); // 既存を保持して追加
```

---

## Eager Loading（N+1問題の解決）

```php
// ❌ N+1問題: 商品5件 → SQL が 1+5=6 回発行される
$products = Product::all();
foreach ($products as $product) {
    echo $product->category->name; // ループごとにSQLが実行される
}

// ✅ Eager Loading: with() で常に2回で済む
$products = Product::with('category')->get();
foreach ($products as $product) {
    echo $product->category->name; // 追加SQLなし
}

// 複数リレーションを一括取得
$products = Product::with(['category', 'tags', 'detail'])->get();
```

| 商品数 | Eager Loadingなし | あり |
|---|---|---|
| 5件 | 6回 | 2回 |
| 100件 | 101回 | 2回 |
| 1000件 | 1001回 | 2回 |

---

## カスタムメソッド

モデルにビジネスロジックを定義して再利用する。

```php
class Product extends Model
{
    const TAX_RATE_STANDARD = 0.1;
    const TAX_RATE_REDUCED  = 0.08;

    public function isExpensive(): bool
    {
        return $this->price >= 100000;
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    public function getFormattedPrice(): string
    {
        return '¥' . number_format($this->price);
    }

    public function getPriceWithTax(float $taxRate = null): string
    {
        $rate = $taxRate ?? self::TAX_RATE_STANDARD;
        return '¥' . number_format($this->price * (1 + $rate));
    }
}
```

```php
$product->isExpensive();                          // true
$product->getFormattedPrice();                    // "¥120,000"
$product->getPriceWithTax();                      // "¥132,000"
$product->getPriceWithTax(Product::TAX_RATE_REDUCED); // "¥129,600"
```

---

## キャスト（Casts）

DB の値を自動型変換する。API レスポンスで特に重要。

```php
protected $casts = [
    'price'        => 'integer',
    'is_published' => 'boolean',  // "1"/"0" → true/false
    'options'      => 'array',    // JSON文字列 → 配列
    'published_at' => 'datetime',
];
```

---

## Tinker でデバッグ

```bash
php artisan tinker

\DB::enableQueryLog();
// 操作...
\DB::getQueryLog();  // 発行された SQL を確認
```

---

## 3つのDB操作方法の比較

| | 生SQL | クエリビルダー | Eloquent ORM |
|---|---|---|---|
| SQLインジェクション | 危険 | `whereRaw()` で危険 | 安全（自動エスケープ） |
| リレーション | JOIN を手書き | JOIN を手書き | `$product->category` |
| タイムスタンプ | 手動 | 手動 | 自動 |
| 推奨度 | ✗ | △ | ✅ |

> 基本は Eloquent ORM を使う。複雑な集計や大量データ処理では生SQL / クエリビルダーが有効だが、`whereRaw()` 使用時は SQL インジェクション対策を忘れずに。

---

## まとめ

| 機能 | 書き方 | 用途 |
|---|---|---|
| 全件取得 | `Model::all()` | 一覧表示 |
| ID 取得 | `Model::find($id)` | 詳細表示 |
| 条件取得 | `where()->get()` | 検索・絞り込み |
| 作成 | `Model::create([...])` | 新規登録 |
| 更新 | `$model->update([...])` | 編集保存 |
| 削除 | `$model->delete()` | 削除 |
| リレーション | `with('relation')` | Eager Loading |
| 多対多操作 | `attach/detach/sync` | 中間テーブル管理 |
