# 01 ルーティング

Laravel のルーティングの仕組みを理解する。URLとプログラムを紐付ける `routes/web.php` の書き方を学ぶ。

---

## ルートの基本構文

```php
// routes/web.php

Route::get('/hello', function () {
    return 'Hello, World!';
});
```

| 部分 | 説明 |
|---|---|
| `Route::get()` | GETリクエストを処理するルートを定義 |
| `'/hello'` | URLのパス |
| `function () { ... }` | 実行される処理（クロージャ） |
| `return '...'` | ブラウザに返す内容 |

---

## 返せるもの

```php
// 文字列
Route::get('/text', function () {
    return 'Hello';
});

// HTML
Route::get('/html', function () {
    return '<h1>タイトル</h1><p>本文</p>';
});

// ビュー（resources/views/company.blade.php を読み込む）
Route::get('/company', function () {
    return view('company');
});
```

> 実務では HTML を直接書かず、`view()` でビューファイルを返すのが一般的。

---

## ルートパラメータ

URLの一部を変数として受け取る。

```php
// 基本
Route::get('/user/{id}', function ($id) {
    return 'ユーザーID: ' . $id;
});
// /user/1 → ユーザーID: 1

// 複数
Route::get('/post/{category}/{id}', function ($category, $id) {
    return "カテゴリ: {$category}, 記事ID: {$id}";
});
// /post/tech/123 → カテゴリ: tech, 記事ID: 123

// オプション（省略可能）
Route::get('/greeting/{name?}', function ($name = 'ゲスト') {
    return "こんにちは、{$name}さん";
});
// /greeting/太郎 → こんにちは、太郎さん
// /greeting     → こんにちは、ゲストさん
```

`{name?}` のように `?` を付けるとパラメータが省略可能になる。

---

## HTTPメソッド

```php
Route::get('/users', function () { ... });     // 取得（ページ表示）
Route::post('/users', function () { ... });    // 送信（フォーム送信）
Route::put('/users/{id}', function ($id) { ... });    // 更新
Route::delete('/users/{id}', function ($id) { ... }); // 削除
```

> まずは `Route::get()` だけ覚えればOK。他は POST フォームや API で必要になったら学ぶ。

---

## ルート名

ルートに名前を付けると、URL変更時の修正箇所を1箇所に絞れる。

```php
// 定義
Route::get('/profile', function () {
    return 'プロフィール';
})->name('profile');

// ビューでの使用
// <a href="{{ route('profile') }}">プロフィール</a>

// コントローラーでのリダイレクト
// return redirect()->route('profile');
```

URLを `/profile` から `/user/profile` に変えても、`route('profile')` を使っている箇所は修正不要。

パラメータ付きルート名：

```php
Route::get('/user/{id}', function ($id) {
    return "ユーザーID: {$id}";
})->name('user.show');

// {{ route('user.show', ['id' => 1]) }} → /user/1
```

---

## ルートグループ

複数のルートに共通の設定（URL prefix、ルート名prefix）をまとめて適用する。

```php
// prefix: 共通のURLプレフィックスを付ける
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () { ... }); // /admin/dashboard
    Route::get('/users', function () { ... });     // /admin/users
    Route::get('/posts', function () { ... });     // /admin/posts
});

// prefix + name: URLとルート名の両方にprefixを付ける
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () { ... })->name('dashboard'); // admin.dashboard
    Route::get('/users', function () { ... })->name('users');         // admin.users
});
```

よくある使い方：

```php
// 管理画面
Route::prefix('admin')->name('admin.')->group(function () { ... });

// APIバージョン管理
Route::prefix('api/v1')->group(function () { ... });

// 多言語対応
Route::prefix('ja')->group(function () { ... });
Route::prefix('en')->group(function () { ... });
```

---

## ルート一覧の確認

```bash
php artisan route:list
```

定義済みのすべてのルート（メソッド・URI・名前・アクション）を一覧表示する。

---

## まとめ

| 機能 | 書き方 | 用途 |
|---|---|---|
| 基本ルート | `Route::get('/path', fn)` | URLとクロージャを紐付ける |
| パラメータ | `{id}` / `{name?}` | 動的なURL、省略可能なURL |
| ルート名 | `->name('名前')` | URL変更時の影響を局所化 |
| グループ | `Route::prefix()->group()` | 共通prefixをまとめて管理 |
| 確認コマンド | `php artisan route:list` | 定義済みルートの一覧表示 |
