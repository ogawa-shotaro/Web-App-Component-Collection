# 08 ページネーション（Pagination）

大量データを分割表示し、表示件数・ソート順・検索条件を URL パラメータで管理する。

---

## 基本実装

`get()` を `paginate()` に変えるだけで動作する。

```php
// コントローラ
$products = Product::with('category')->paginate(10);

return view('products.index', compact('products'));
```

```html
{{-- ビュー --}}
@foreach ($products as $product)
    <tr>
        <td>{{ $product->name }}</td>
        <td>{{ $product->category->name }}</td>
    </tr>
@endforeach

{{-- ページネーションリンクを自動生成 --}}
{{ $products->links() }}
```

> `links()` のスタイルには Tailwind CSS が必要。開発中は CDN（`<script src="https://cdn.tailwindcss.com">`）でも可。

---

## paginator オブジェクトのメソッド

```php
$products->total()        // 総件数
$products->firstItem()    // 現在ページの最初のアイテム番号
$products->lastItem()     // 現在ページの最後のアイテム番号
$products->currentPage()  // 現在のページ番号
$products->hasPages()     // 複数ページがあるか（true/false）
$products->hasMorePages() // 次のページがあるか（true/false）
```

```html
<p>全 {{ $products->total() }} 件中 {{ $products->firstItem() }} 〜 {{ $products->lastItem() }} 件を表示</p>
```

---

## 表示件数・ソートのカスタマイズ

```php
public function index(Request $request)
{
    // バリデーション（ホワイトリストで安全に）
    $validated = $request->validate([
        'per_page'   => 'nullable|integer|in:10,20,50',
        'sort_by'    => 'nullable|string|in:created_at,price,name,stock',
        'sort_order' => 'nullable|string|in:asc,desc',
    ]);

    $perPage    = $validated['per_page']   ?? 10;
    $sortBy     = $validated['sort_by']    ?? 'created_at';
    $sortOrder  = $validated['sort_order'] ?? 'desc';

    $products = Product::with('category')
        ->orderBy($sortBy, $sortOrder)
        ->paginate($perPage);

    return view('pagination.index', compact('products', 'perPage', 'sortBy', 'sortOrder'));
}
```

> `in:10,20,50` のようなホワイトリスト検証は必須。検証なしだと `?per_page=999999999` で大量取得を試みられる。

---

## ビュー側の実装

```html
{{-- 表示件数プルダウン --}}
<form method="GET" action="/products">
    <select name="per_page" onchange="this.form.submit()">
        <option value="10" {{ $perPage == 10 ? 'selected' : '' }}>10件</option>
        <option value="20" {{ $perPage == 20 ? 'selected' : '' }}>20件</option>
        <option value="50" {{ $perPage == 50 ? 'selected' : '' }}>50件</option>
    </select>
</form>

{{-- ソートプルダウン --}}
<form method="GET" action="/products">
    <input type="hidden" name="per_page" value="{{ $perPage }}">

    <select name="sort_by" onchange="this.form.submit()">
        <option value="created_at" {{ $sortBy == 'created_at' ? 'selected' : '' }}>登録日</option>
        <option value="price"      {{ $sortBy == 'price'      ? 'selected' : '' }}>価格</option>
        <option value="name"       {{ $sortBy == 'name'       ? 'selected' : '' }}>商品名</option>
    </select>

    <select name="sort_order" onchange="this.form.submit()">
        <option value="desc" {{ $sortOrder == 'desc' ? 'selected' : '' }}>降順</option>
        <option value="asc"  {{ $sortOrder == 'asc'  ? 'selected' : '' }}>昇順</option>
    </select>
</form>

{{-- ページネーション（全パラメータを引き継ぐ） --}}
{{ $products->appends([
    'per_page'   => $perPage,
    'sort_by'    => $sortBy,
    'sort_order' => $sortOrder,
])->links() }}
```

---

## appends() でパラメータを保持

```php
// ❌ appends() なし → ページ移動で per_page・sort 条件が消える
{{ $products->links() }}

// ✅ appends() あり → 全パラメータを引き継ぐ
{{ $products->appends(['per_page' => $perPage, 'sort_by' => $sortBy])->links() }}
```

生成される URL 例：
```
/products?per_page=20&sort_by=price&sort_order=asc&page=2
```

---

## ページネーションビューの日本語化

```bash
php artisan vendor:publish --tag=laravel-pagination
# → resources/views/vendor/pagination/tailwind.blade.php が作成される
```

`tailwind.blade.php` の表示テキスト部分を編集：

```html
{{-- 変更後（自然な日本語） --}}
全 <span class="font-medium">{{ $paginator->total() }}</span> 件中
<span class="font-medium">{{ $paginator->firstItem() }}</span> 〜
<span class="font-medium">{{ $paginator->lastItem() }}</span> 件を表示
```

---

## URL パラメータのまとめ

```
/products?per_page=20&sort_by=price&sort_order=asc&page=2
           ↑表示件数    ↑ソートカラム  ↑昇降順        ↑ページ番号
```

`page` パラメータは Laravel が自動処理するため、`appends()` に含めなくてよい。

---

## まとめ

| 機能 | 実装 |
|---|---|
| ページネーション | `paginate(10)` |
| リンク生成 | `$products->links()` |
| 総件数 | `$products->total()` |
| 表示範囲 | `firstItem()` / `lastItem()` |
| パラメータ保持 | `appends([...])->links()` |
| ソート | `orderBy($sortBy, $sortOrder)` |
| セキュリティ | `validate()` + `in:` でホワイトリスト検証 |
