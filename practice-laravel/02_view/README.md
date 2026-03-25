# 02 ビュー（View）

Laravel のビューの仕組みを理解する。HTML を `resources/views/` に分離し、Blade テンプレートエンジンで動的な表示を実現する。

---

## ビューの基本

ビューファイルは `resources/views/` に `.blade.php` で作成する。

```php
// routes/web.php
Route::get('/hello', function () {
    return view('hello'); // resources/views/hello.blade.php を読み込む
});
```

```html
<!-- resources/views/hello.blade.php -->
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>Hello</title></head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

> `view()` の引数は `.blade.php` を省略して書く。

---

## データの渡し方

3通りの方法があるが、どれも同じ結果になる。

```php
// 方法1: 配列で渡す（最もシンプル）
return view('greeting', ['name' => '太郎', 'age' => 25]);

// 方法2: with() を使う
return view('greeting')->with('name', '太郎');

// 方法3: compact() を使う（変数が複数のとき便利）
$name = '太郎';
$age  = 25;
return view('greeting', compact('name', 'age'));
```

```html
<!-- resources/views/greeting.blade.php -->
<h1>こんにちは、{{ $name }}さん！</h1>
<p>{{ $age }}歳ですね。</p>
```

---

## Blade 基本構文

### 変数の表示

```html
{{ $name }}       ← 自動エスケープあり（XSS対策済み・通常はこちら）
{!! $html !!}     ← エスケープなし（信頼できるデータのみ）
{{ $name ?? 'ゲスト' }}  ← null または未定義のときデフォルト値
```

> ユーザー入力には必ず `{{ }}` を使う。`{!! !!}` は管理者が作ったHTMLコンテンツのみ。

### if / unless

```html
@if ($age >= 20)
    <p>成人です</p>
@elseif ($age >= 13)
    <p>未成年です</p>
@else
    <p>子供です</p>
@endif

@unless ($user->isAdmin())
    <p>管理者ではありません</p>
@endunless
```

### foreach / forelse

```html
@foreach ($users as $user)
    <li>{{ $user }}</li>
@endforeach

{{-- データが空のときの処理を含む場合は forelse --}}
@forelse ($users as $user)
    <li>{{ $user }}</li>
@empty
    <p>ユーザーがいません</p>
@endforelse
```

### ループ変数 `$loop`

```html
@foreach ($users as $user)
    <p>{{ $loop->iteration }}番目: {{ $user }}</p>
    @if ($loop->first) <span>最初</span> @endif
    @if ($loop->last)  <span>最後</span> @endif
@endforeach
```

| プロパティ | 内容 |
|---|---|
| `$loop->index` | 0始まりのインデックス |
| `$loop->iteration` | 1始まりの連番 |
| `$loop->first` | 最初の要素か |
| `$loop->last` | 最後の要素か |
| `$loop->count` | 要素の総数 |

### isset / empty チェック

```html
@isset($name)
    <p>{{ $name }}</p>
@endisset

@empty($users)
    <p>データなし</p>
@endempty
```

| 値 | `??` | `@isset` | `@empty` |
|---|---|---|---|
| `'太郎'` | 表示 | true | false |
| `''`（空文字） | 表示 | true | true |
| `null` | デフォルト値 | false | true |
| `0` | 表示 | true | true |
| 未定義 | デフォルト値 | false | true |

> `??` と `@isset` は null・未定義だけを弾く。`@empty` は空文字・0・null・false・未定義すべてを弾く。

### コメント

```html
{{-- Bladeコメント（HTMLに出力されない） --}}
<!-- HTMLコメント（HTMLに出力される） -->
```

---

## サブディレクトリ

ビューが増えたらディレクトリで整理し、ドット記法でアクセスする。

```
resources/views/
├── users/
│   ├── index.blade.php   → view('users.index')
│   └── show.blade.php    → view('users.show')
└── welcome.blade.php     → view('welcome')
```

```php
Route::get('/users', function () {
    return view('users.index');
});
```

---

## レイアウトの共通化（@extends / @yield / @section）

ヘッダー・フッターなど共通部分を親ファイルに切り出す。

```
親ファイル (layouts/app.blade.php)
  @yield('content') ← 穴あけ
       ↑ @extends で継承
子ファイル (pages/about.blade.php)
  @section('content') ... @endsection ← 穴を埋める
```

```html
<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>@yield('title', 'My Website')</title>
</head>
<body>
    <header><h1>My Website</h1></header>
    <main>@yield('content')</main>
    <footer><p>© 2025</p></footer>
</body>
</html>
```

```html
<!-- resources/views/pages/about.blade.php -->
@extends('layouts.app')

@section('title', '会社概要')

@section('content')
    <h2>会社概要</h2>
    <p>説明文</p>
@endsection
```

**順番のルール：**
- `@extends` は必ず1行目
- `@section` の順番は自由（推奨：短い内容を上、長い内容を下）

---

## コンポーネント

繰り返し使う UI 部品を `resources/views/components/` に切り出す。

**ファイル配置と呼び出し名：**

| ファイルパス | コンポーネント名 |
|---|---|
| `components/button.blade.php` | `<x-button>` |
| `components/user-card.blade.php` | `<x-user-card>` |
| `components/form/input.blade.php` | `<x-form.input>` |

```html
<!-- resources/views/components/button.blade.php -->
@props(['type' => 'primary'])

<button class="btn btn-{{ $type }}">
    {{ $slot }}
</button>
```

```html
<!-- 使用側 -->
<x-button>送信する</x-button>
<x-button type="danger">削除</x-button>
```

- `@props` で受け取る属性とデフォルト値を定義
- `{{ $slot }}` にタグ間の内容が入る

### 名前付きスロット

複数の領域に異なるHTMLを渡すとき使う。属性（`footer="..."`)では HTML を渡せないため。

```html
<!-- resources/views/components/card.blade.php -->
@props(['title', 'footer' => null])

<div class="card">
    <h3>{{ $title }}</h3>
    <div>{{ $slot }}</div>
    @if ($footer)
        <div class="card-footer">{{ $footer }}</div>
    @endif
</div>
```

```html
<!-- 使用側 -->
<x-card title="ユーザー情報">
    <p>名前: 太郎</p>

    <x-slot:footer>
        <button>編集</button>
        <button>削除</button>
    </x-slot:footer>
</x-card>
```

---

## フォーム関連ディレクティブ（詳細は後の章）

```html
<form method="POST" action="/users">
    @csrf          ← CSRF対策トークン（POSTフォームには必須）
    @method('PUT') ← HTMLフォームで PUT/DELETE を擬似的に指定

    <input type="text" name="name">
    <button type="submit">送信</button>
</form>
```

```html
@auth
    <a href="/logout">ログアウト</a>
@endauth

@guest
    <a href="/login">ログイン</a>
@endguest
```

---

## まとめ

| 機能 | 書き方 | 用途 |
|---|---|---|
| ビュー読み込み | `view('name')` | ルートからビューを返す |
| 変数表示 | `{{ $var }}` / `{!! $var !!}` | 安全表示 / HTML出力 |
| 制御構文 | `@if` `@foreach` `@forelse` | ロジックの記述 |
| レイアウト | `@extends` `@yield` `@section` | 共通ヘッダー・フッター |
| コンポーネント | `<x-name>` `@props` `$slot` | 再利用可能な UI 部品 |
| フォーム | `@csrf` `@method` | セキュアなフォーム送信 |
