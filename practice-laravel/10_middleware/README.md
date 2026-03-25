# 10 ミドルウェアと権限管理

認証（誰か）と認可（何ができるか）を分離し、ミドルウェアとロールでアクセス制御を実装する。

---

## 認証 vs 認可

| | 認証（Authentication） | 認可（Authorization） |
|---|---|---|
| 問い | 「あなたは誰ですか？」 | 「あなたには権限がありますか？」 |
| 実装 | ログイン機能 | ミドルウェア・ロール管理 |
| Laravelの仕組み | `auth()->check()` | `isAdmin()` / Gate / Policy |

---

## ミドルウェアの仕組み

コントローラーが実行される前にチェックを行う「番人」。

```php
// app/Http/Middleware/IsAdmin.php
class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');  // ここで処理を止める
        }

        if (!auth()->user()->isAdmin()) {
            abort(403, 'アクセス権限がありません。');  // ここで処理を止める
        }

        return $next($request);  // 全てOK → コントローラーへ進む
    }
}
```

```
リクエスト → [ミドルウェア handle()] → 条件OK → $next($request) → コントローラー
                                        条件NG → redirect() / abort()  ← ここで止まる
```

> `$next($request)` = 次の処理（別のミドルウェアまたはコントローラー）へ渡す。

---

## ロールの追加

```bash
php artisan make:migration add_role_to_users_table
```

```php
// マイグレーション
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['admin', 'user'])->default('user')->after('name');
});
```

```php
// app/Models/User.php
protected $fillable = ['name', 'email', 'password', 'role'];

public function isAdmin(): bool
{
    return $this->role === 'admin';
}

public function hasRole(string $role): bool
{
    return $this->role === $role;
}

public function hasAnyRole(array $roles): bool
{
    return in_array($this->role, $roles);
}
```

---

## カスタムミドルウェアの作成と登録

```bash
php artisan make:middleware IsAdmin
# → app/Http/Middleware/IsAdmin.php が作成される
```

```php
// bootstrap/app.php（Laravel 11+）
->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'admin' => \App\Http\Middleware\IsAdmin::class,
    ]);
})
```

---

## ルートへの適用

```php
// 個別に適用
Route::get('/dashboard', fn() => view('dashboard'))
    ->middleware('admin')
    ->name('dashboard');

// グループで一括適用（推奨）
Route::middleware('admin')->group(function () {
    Route::get('/dashboard', fn() => view('dashboard'))->name('dashboard');
    Route::get('/users', [UserController::class, 'index']);
});

// 一般ユーザー用（認証のみ）
Route::middleware('auth')->group(function () {
    Route::get('/home', fn() => view('home'))->name('home');
});
```

> `middleware(['admin'])` 1つで「ログインチェック ＋ 管理者チェック」の両方を実行できる（IsAdmin 内でどちらもチェックしているため）。

---

## ログイン後の役割別リダイレクト

```php
// LoginController
public function login(Request $request)
{
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();

        // 役割に応じてリダイレクト先を変える
        return auth()->user()->isAdmin()
            ? redirect()->route('dashboard')
            : redirect()->route('home');
    }

    return back()->withErrors([
        'email' => 'メールアドレスまたはパスワードが正しくありません。',
    ])->onlyInput('email');
}
```

---

## Blade での権限チェック

```html
@auth
    @if (auth()->user()->isAdmin())
        <a href="{{ route('dashboard') }}">管理画面</a>
    @else
        <a href="{{ route('home') }}">ホーム</a>
    @endif
@endauth
```

---

## Laravel 標準ミドルウェア

| ミドルウェア | 役割 |
|---|---|
| `auth` | ログイン必須（未ログインなら `/login` へリダイレクト） |
| `guest` | 未ログイン必須（ログイン中なら弾く） |
| `verified` | メール認証済み必須 |
| `throttle` | レート制限（アクセス回数制限） |

---

## ページ・権限の設計例

| ページ | 認証 | 認可 |
|---|---|---|
| トップページ | 不要 | 不要 |
| ホーム（`/home`） | `auth` | なし |
| ダッシュボード（`/dashboard`） | `admin` 内でチェック | 管理者のみ |
| ユーザー管理 | `admin` 内でチェック | 管理者のみ |

---

## まとめ

| 機能 | 実装 |
|---|---|
| ロールカラム追加 | `$table->enum('role', ['admin', 'user'])->default('user')` |
| ロール判定メソッド | `isAdmin()` / `hasRole()` / `hasAnyRole()` |
| ミドルウェア作成 | `php artisan make:middleware IsAdmin` |
| ミドルウェア登録 | `bootstrap/app.php` の `$middleware->alias()` |
| ルートへの適用 | `->middleware('admin')` / `Route::middleware()->group()` |
| 役割別リダイレクト | `LoginController` で `isAdmin()` を判定 |
