# 06 検索・フィルタリング

キーワード検索・カテゴリー絞り込み・ページネーションを組み合わせてデータ検索機能を実装する。

---

## ルート・コントローラの基本

```php
// routes/web.php
Route::get('/search', [SearchController::class, 'index']);
```

```php
// app/Http/Controllers/SearchController.php
public function index(Request $request)
{
    $keyword    = $request->input('keyword');
    $categoryId = $request->input('category_id');

    $products = Product::with('category')
        ->when($keyword, function ($query, $keyword) {
            return $query->where('name', 'like', "%{$keyword}%");
        })
        ->when($categoryId, function ($query, $categoryId) {
            return $query->where('category_id', $categoryId);
        })
        ->paginate(10);

    $categories = Category::all();

    return view('search.index', compact('products', 'keyword', 'categoryId', 'categories'));
}
```

---

## LIKE 検索

```php
// 部分一致（最もよく使う）
->where('name', 'like', "%{$keyword}%")  // 「ノート」→ ノートPC、大学ノート

// 前方一致
->where('name', 'like', "{$keyword}%")   // 「ノート」→ ノートPC のみ

// 後方一致
->where('name', 'like', "%{$keyword}")   // 「ノート」→ 大学ノート のみ
```

> 前後に `%` があるとインデックスが使われず全件スキャンになる。大量データでは全文検索エンジンを検討。

---

## when() メソッド

条件が truthy のときだけクエリを追加する。`if` 文なしでメソッドチェーンを保てる。

```php
// ❌ if 文（冗長）
$query = Product::query();
if ($keyword)    { $query->where('name', 'like', "%{$keyword}%"); }
if ($categoryId) { $query->where('category_id', $categoryId); }
$products = $query->paginate(10);

// ✅ when()（スッキリ）
$products = Product::when($keyword, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
    ->when($categoryId, fn($q, $v) => $q->where('category_id', $v))
    ->paginate(10);
```

| 第1引数 | 動作 |
|---|---|
| truthy（文字列、非0、非null） | コールバック実行 |
| falsy（null・空文字・0・false） | 何もしない |

---

## 検索フォーム（GET リクエスト）

```html
<form method="GET" action="/search">
    {{-- キーワード入力（value で検索値を保持） --}}
    <input type="text" name="keyword" value="{{ $keyword }}">

    {{-- カテゴリープルダウン（selected で選択値を保持） --}}
    <select name="category_id">
        <option value="">すべてのカテゴリー</option>
        @foreach ($categories as $category)
            <option value="{{ $category->id }}"
                {{ $categoryId == $category->id ? 'selected' : '' }}>
                {{ $category->name }}
            </option>
        @endforeach
    </select>

    <button type="submit">検索</button>
</form>
```

**GET リクエストを使う理由：**
- URL に検索条件が含まれる（ブックマーク・シェア可能）
- ブラウザの戻るボタンが使える
- ページネーションと組み合わせやすい

---

## 検索結果の表示

```html
<p>検索結果: {{ $products->total() }}件</p>

<table>
    @forelse ($products as $product)
        <tr>
            <td>{{ $product->name }}</td>
            <td>{{ $product->category->name }}</td>
            <td>¥{{ number_format($product->price) }}</td>
        </tr>
    @empty
        <tr><td colspan="3">該当する商品が見つかりませんでした</td></tr>
    @endforelse
</table>

{{-- ページネーション（検索条件を保持） --}}
{{ $products->appends(['keyword' => $keyword, 'category_id' => $categoryId])->links() }}
```

---

## appends() でページネーションに検索条件を保持

```php
// ❌ appends() なし → 2ページ目で検索条件が消える
// URL: /search?page=2（keyword が消える）
{{ $products->links() }}

// ✅ appends() あり → 検索条件をすべてのページに引き継ぐ
// URL: /search?keyword=ノート&category_id=1&page=2
{{ $products->appends(['keyword' => $keyword, 'category_id' => $categoryId])->links() }}
```

---

## ページネーションの日本語化

```bash
# ページネーションビューを公開
php artisan vendor:publish --tag=laravel-pagination
# → resources/views/vendor/pagination/tailwind.blade.php が作成される
```

`tailwind.blade.php` の表示テキスト部分を編集：

```html
{{-- 変更前（不自然な日本語） --}}
{!! __('Showing') !!} ... {!! __('to') !!} ... {!! __('of') !!} ... {!! __('results') !!}

{{-- 変更後（自然な日本語） --}}
全 <span class="font-medium">{{ $paginator->total() }}</span> 件中
<span class="font-medium">{{ $paginator->firstItem() }}</span> 〜
<span class="font-medium">{{ $paginator->lastItem() }}</span> 件を表示
```

> `links()` のスタイルには Tailwind CSS が必要。開発中は CDN（`<script src="https://cdn.tailwindcss.com">`）でも可。

---

## クエリパラメータ

```
/search?keyword=ノート&category_id=1&page=2
         ↑キーワード    ↑カテゴリー    ↑ページ
```

```php
$request->input('keyword');       // "ノート"
$request->input('category_id');   // "1"
$request->input('keyword', '');   // デフォルト値付き
```

---

## まとめ

| 機能 | 実装 |
|---|---|
| キーワード検索 | `where('name', 'like', "%{$keyword}%")` |
| カテゴリー絞り込み | `where('category_id', $categoryId)` |
| 条件付きクエリ | `when($value, fn($q, $v) => ...)` |
| 検索値の保持 | `value="{{ $keyword }}"` / `selected` |
| ページネーション保持 | `appends([...])->links()` |
| 総件数の表示 | `$products->total()` |
