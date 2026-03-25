# 03 コントローラ（Controller）

ルートファイルに直接書いていたロジックをコントローラに移し、MVC アーキテクチャに沿った設計を理解する。

---

## コントローラの作成

```bash
php artisan make:controller UserController
# → app/Http/Controllers/UserController.php が作成される

php artisan make:controller Admin/UserController
# → サブディレクトリ付きで作成
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = ['太郎', '花子', '次郎'];
        return view('users.index', compact('users'));
    }

    public function show($id)
    {
        $user = ['id' => $id, 'name' => '太郎'];
        return view('users.show', compact('user'));
    }
}
```

```php
// routes/web.php
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
```

> `::class` はクラスの完全修飾名を文字列で取得する記法。タイポ検知・IDE補完・リファクタリングに強い。

---

## リソースコントローラ

CRUD 操作の 7 メソッドを一括生成する。

```bash
php artisan make:controller UserController --resource
```

```php
// routes/web.php
Route::resource('users', UserController::class);
```

自動定義されるルート：

| メソッド | URI | アクション | 用途 |
|---|---|---|---|
| GET | `/users` | `index` | 一覧 |
| GET | `/users/create` | `create` | 新規フォーム |
| POST | `/users` | `store` | 保存 |
| GET | `/users/{id}` | `show` | 詳細 |
| GET | `/users/{id}/edit` | `edit` | 編集フォーム |
| PUT/PATCH | `/users/{id}` | `update` | 更新 |
| DELETE | `/users/{id}` | `destroy` | 削除 |

```bash
php artisan route:list  # 定義済みルートを確認
```

---

## フォームデータの受け取り（Request）

メソッドに `Request $request` と書くと、Laravel が自動的にインスタンスを渡す（依存性注入）。

```php
public function store(Request $request)
{
    $name  = $request->input('name');
    $price = $request->input('price', 0); // デフォルト値

    $all   = $request->all();                        // 全データ
    $data  = $request->only(['name', 'price']);      // 指定キーのみ
    $data  = $request->except(['_token']);           // 指定キー以外
}
```

> HTML の `name` 属性と `input()` の引数は完全一致が必要。

---

## バリデーション

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'name'        => 'required|max:100',
        'price'       => 'required|integer|min:0|max:10000000',
        'description' => 'required|max:500',
    ]);

    // バリデーション成功時のみここに到達
    // $validated には検証済みデータが入る
}
```

主なルール：

| ルール | 内容 |
|---|---|
| `required` | 必須 |
| `max:n` | 最大文字数または最大値 |
| `min:n` | 最小値 |
| `integer` | 整数のみ |
| `email` | メール形式 |
| `unique:table` | DB でのユニーク確認 |
| `confirmed` | 確認フィールドと一致 |

**バリデーション失敗時の自動処理：**
- 元のページ（フォーム）へリダイレクト
- エラーメッセージをセッションに保存（`$errors` で参照）
- 入力値をセッションに保存（`old()` で復元）

```html
{{-- ビューでのエラー表示 --}}
@if ($errors->any())
    @foreach ($errors->all() as $error)
        <li>{{ $error }}</li>
    @endforeach
@endif

<input name="name" value="{{ old('name') }}">

@error('name')
    <span>{{ $message }}</span>
@enderror
```

---

## abort によるエラーレスポンス

```php
abort(404);                            // Not Found
abort(403, 'アクセス権限がありません'); // Forbidden
abort_if(!$product, 404);             // 条件付き
abort_unless($user->isAdmin(), 403);  // 条件付き（逆）
```

---

## リダイレクト（PRG パターン）

POST 処理後は `view()` で返さず `redirect()` を使う。

**なぜか：** `view()` で別画面を返してもブラウザの履歴には POST リクエストが残るため、F5 リロードで処理が再実行される。

```php
// URL でリダイレクト
return redirect('/products');

// ルート名でリダイレクト（推奨）
return redirect()->route('products.index');

// 前のページに戻る
return back();

// フラッシュメッセージ付き
return redirect('/products')->with('success', '登録しました');
```

```html
{{-- ビューでフラッシュメッセージを表示 --}}
@if (session('success'))
    <div>{{ session('success') }}</div>
@endif
```

> `redirect()->with()` はセッションに1回だけ保存されるフラッシュデータ。`view()->with()` とは別物。

---

## HTML フォームで PUT / DELETE を使う

HTML の `<form>` は GET と POST しか対応していないため `@method` で擬似指定する。

```html
{{-- 更新フォーム --}}
<form action="/products/{{ $id }}" method="POST">
    @csrf
    @method('PUT')
    <button type="submit">更新</button>
</form>

{{-- 削除フォーム --}}
<form action="/products/{{ $id }}" method="POST">
    @csrf
    @method('DELETE')
    <button type="submit">削除</button>
</form>
```

---

## セッション

ユーザーごとの一時的な保存場所。Laravel 11 以降はデフォルトで DB（`sessions` テーブル）に保存。

```php
// 保存
session(['key' => 'value']);
session()->put('key', 'value');

// 取得
$value = session('key');
$value = session('key', 'デフォルト');

// 全取得 / 存在確認 / 削除
$all = session()->all();
session()->has('key');
session()->forget('key');
session()->flush(); // 全削除

// フラッシュデータ（1回だけ取得できる）
session()->flash('message', '成功');
```

**Cookie との関係：**
- Cookie にはセッション ID（暗号化済み）だけが保存される
- 実際のデータはサーバー側（DB）に保存される
- `APP_KEY` で暗号化・復号化される

**すでにセッションを使っている場所：**

| 機能 | セッションの使われ方 |
|---|---|
| `@csrf` | CSRF トークンをセッションに保存して照合 |
| `old('name')` | バリデーションエラー時の入力値をセッションに保存 |
| `@error` | エラーメッセージをセッション経由で渡す |
| `->with('success', ...)` | フラッシュメッセージをセッションに保存 |

---

## まとめ

| 機能 | 書き方 | 用途 |
|---|---|---|
| コントローラ作成 | `make:controller` | ロジックの整理 |
| リソースコントローラ | `--resource` / `Route::resource()` | CRUD の一括定義 |
| フォームデータ取得 | `$request->input('key')` | 送信値の受け取り |
| バリデーション | `$request->validate([...])` | 入力チェック |
| エラー表示 | `@error` / `old()` / `$errors` | バリデーション結果の表示 |
| リダイレクト | `redirect()` / `->with()` | PRG パターン |
| セッション | `session()` | 一時データの保存 |
