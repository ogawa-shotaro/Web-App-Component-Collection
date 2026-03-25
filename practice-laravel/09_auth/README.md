# 09 認証（Authentication）

セッション・Cookie の仕組みを理解しながら、ライブラリに頼らずユーザー登録・ログイン・ログアウト機能をスクラッチで実装する。

---

## 認証の仕組み

HTTP はステートレス（リクエストごとに状態を記憶しない）なため、セッションで状態を保持する。

```
1. ログイン成功
   → セッション ID を発行、Cookie に保存
   → セッションストア（DB）に { login_web_xxx: 1 } を保存

2. 次回リクエスト
   → ブラウザが Cookie を自動送信
   → サーバーがセッション ID からユーザー ID を取得
   → DB からユーザー情報を復元
```

---

## User モデルのポイント

```php
class User extends Authenticatable
{
    protected $fillable = ['name', 'email', 'password'];

    // JSON/配列変換時に除外する属性（APIレスポンスでパスワードを隠す）
    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime', // 文字列 → Carbon オブジェクトに自動変換
        'password'          => 'hashed',   // 保存時に自動ハッシュ化（Laravel 10+）
    ];
}
```

> `'password' => 'hashed'` により `User::create(['password' => '平文'])` で自動ハッシュ化される。

---

## ユーザー登録

```php
// RegisterController
public function register(Request $request)
{
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed', // password_confirmation フィールドと一致
    ]);

    $user = User::create($validated); // password は自動ハッシュ化

    Auth::login($user); // 登録後に自動ログイン

    return redirect()->route('dashboard');
}
```

| バリデーションルール | 意味 |
|---|---|
| `unique:users` | users テーブルでメールアドレスの重複チェック |
| `confirmed` | `password_confirmation` フィールドと一致するか（命名規則固定） |

---

## ログイン

```php
// LoginController
public function login(Request $request)
{
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate(); // セッション固定攻撃を防ぐ（必須）

        // ログイン前にアクセスしようとしていたページへ（なければ dashboard）
        return redirect()->intended(route('dashboard'));
    }

    return back()->withErrors([
        'email' => 'メールアドレスまたはパスワードが正しくありません。',
    ])->onlyInput('email'); // パスワードは復元しない
}
```

**`Auth::attempt()` の内部動作：**
1. email で DB を検索
2. `Hash::check($password, $user->password)` でパスワード照合
3. 成功 → セッションにユーザー ID を保存

---

## ログアウト（3ステップ必須）

```php
Route::post('/logout', function (Request $request) {
    Auth::logout();                       // ① セッションから認証情報（login_web_*）を削除
    $request->session()->invalidate();    // ② セッション ID を無効化（DB削除＋新 ID 発行）
    $request->session()->regenerateToken(); // ③ CSRF トークンを再生成
    return redirect('/');
})->name('logout');
```

| 処理 | 目的 |
|---|---|
| `Auth::logout()` | セッション payload から `login_web_*` を削除 |
| `session()->invalidate()` | セッション ID 自体を無効化（セッション固定攻撃対策） |
| `session()->regenerateToken()` | CSRF トークンを再生成（古いフォームからの送信を無効化） |

---

## 認証状態の確認

```php
// コントローラ・ルートで
auth()->check();   // ログイン中か（true/false）
auth()->user();    // ログイン中のユーザーオブジェクト（未ログインなら null）
auth()->id();      // ログイン中のユーザー ID（未ログインなら null）
```

```html
{{-- Blade で --}}
@auth
    <p>ようこそ、{{ auth()->user()->name }}さん！</p>
    <form action="{{ route('logout') }}" method="POST">
        @csrf
        <button type="submit">ログアウト</button>
    </form>
@endauth

@guest
    <a href="{{ route('login') }}">ログイン</a>
@endguest
```

---

## ルート保護（auth ミドルウェア）

```php
// 個別に適用
Route::get('/dashboard', fn() => view('dashboard'))->middleware('auth')->name('dashboard');

// グループで一括適用
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/profile', [ProfileController::class, 'show']);
});
```

未ログイン時は自動的に `/login` へリダイレクト。`intended()` でログイン前の URL に戻せる。

---

## Facade とヘルパー関数

```php
// Facade（use が必要）
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

Auth::login($user);
Auth::attempt($credentials);
Auth::logout();
Auth::check();
Auth::user();

Hash::make('password');
Hash::check('password', $hash);

// ヘルパー関数（use 不要、どこでも使える）
auth()->login($user);
auth()->check();
auth()->user();

// どちらも同じ動作。Blade では auth() ヘルパーが簡潔
```

**よく使うヘルパー関数まとめ：**

| 関数 | 用途 |
|---|---|
| `auth()` | 認証状態・ログインユーザー取得 |
| `view('name')` | ビューを返す |
| `redirect()->route('name')` | 名前付きルートへリダイレクト |
| `redirect()->intended('fallback')` | ログイン前 URL or フォールバックへ |
| `old('key')` | バリデーションエラー時の入力値復元 |
| `route('name')` | 名前付きルートの URL 生成 |
| `now()` | 現在日時（Carbon） |
| `session('key')` | セッション値の取得 |
| `config('key')` | 設定値の取得 |
| `dd($var)` | デバッグ（出力して停止） |

---

## レート制限（ブルートフォース対策）

```php
use Illuminate\Support\Facades\RateLimiter;

$key = 'login:' . $request->email . ':' . $request->ip();

// 5回失敗したら1分間ロック
if (RateLimiter::tooManyAttempts($key, 5)) {
    $seconds = RateLimiter::availableIn($key);
    return back()->withErrors(['email' => "{$seconds}秒後に再試行してください。"]);
}

if (Auth::attempt($credentials)) {
    RateLimiter::clear($key); // 成功したらカウンターリセット
    $request->session()->regenerate();
    return redirect()->intended(route('dashboard'));
}

RateLimiter::hit($key, 60); // 失敗したらカウンターを増加（60秒保持）
```

---

## セキュリティまとめ

| リスク | 対策 |
|---|---|
| パスワード流出 | `$casts = ['password' => 'hashed']` で自動ハッシュ化 |
| CSRF 攻撃 | フォームに `@csrf` を必ず含める |
| セッション固定攻撃 | ログイン時に `session()->regenerate()`、ログアウト時に `invalidate()` |
| SQLインジェクション | Eloquent ORM を使う（自動エスケープ） |
| XSS | Blade で `{{ }}` を使う（自動エスケープ）、`{!! !!}` は使わない |
| ブルートフォース | `RateLimiter` でログイン試行回数を制限 |
| APIパスワード流出 | `$hidden = ['password']` で JSON 変換時に除外 |

---

## ルート定義まとめ

```php
Route::get('/register',  [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);

Route::get('/login',  [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', fn() => view('dashboard'))->name('dashboard');
});
```
