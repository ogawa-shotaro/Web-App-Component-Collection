# 05 マイグレーション（Migration）

データベースのテーブル構造をコードで管理し、バージョン管理・チーム共有・ロールバックを可能にする仕組み。

---

## マイグレーションの構造

```php
// database/migrations/2025_01_22_123456_create_products_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('商品名');
            $table->text('description')->nullable()->comment('商品説明');
            $table->integer('price')->comment('価格');
            $table->integer('stock')->default(0)->comment('在庫数');
            $table->boolean('is_published')->default(false)->comment('公開状態');
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

> `up()` と `down()` は必ず対にする。`up()` でテーブル作成なら `down()` でテーブル削除。

---

## コマンド一覧

```bash
# 作成
php artisan make:migration create_products_table
php artisan make:migration add_price_to_products_table
php artisan make:migration modify_description_in_products_table

# 実行
php artisan migrate              # 未実行のマイグレーションを実行
php artisan migrate:status       # 実行状態を確認
php artisan migrate:rollback     # 最後のバッチを元に戻す
php artisan migrate:rollback --step=3  # 指定ステップ数だけ戻す
php artisan migrate:fresh        # 全テーブル DROP → 再実行（高速・推奨）
php artisan migrate:refresh      # down() でロールバック → 再実行（遅い）
php artisan migrate:fresh --seed # 全削除 → 再実行 → Seeder 実行
```

| コマンド | 動作 |
|---|---|
| `migrate` | 未実行のみ実行 |
| `migrate:rollback` | 最後のバッチを `down()` で戻す |
| `migrate:fresh` | 全テーブルを DROP して再実行 |
| `migrate:refresh` | 全バッチを `down()` で戻して再実行 |

> `fresh` / `refresh` は本番環境では絶対に使わない（全データ消失）。

---

## カラム型

| メソッド | MySQL 型 | 用途 |
|---|---|---|
| `id()` | BIGINT UNSIGNED PK | 主キー（自動採番） |
| `string('name')` | VARCHAR(255) | 名前・タイトル・メール |
| `text('body')` | TEXT | 長い文章・説明 |
| `integer('price')` | INT | 整数（価格・数量） |
| `boolean('is_active')` | TINYINT(1) | true/false（0/1） |
| `foreignId('user_id')` | BIGINT UNSIGNED | 外部キー |
| `timestamps()` | TIMESTAMP × 2 | created_at / updated_at |

---

## カラム修飾子

| 修飾子 | 意味 |
|---|---|
| `->nullable()` | NULL 許可 |
| `->default($value)` | デフォルト値 |
| `->unique()` | 重複不可 |
| `->after('name')` | 挿入位置を指定 |
| `->comment('説明')` | カラムにコメントを付ける |

---

## 外部キー制約

```php
// シンプルな書き方（推奨）
$table->foreignId('category_id')
      ->constrained()           // category_id → categories テーブルを自動推測
      ->onDelete('restrict');   // デフォルト。子が存在する場合は親を削除不可

// テーブル名を明示する場合
$table->foreignId('category_id')
      ->constrained('categories')
      ->onDelete('cascade');
```

| `onDelete` | 動作 | 用途 |
|---|---|---|
| `restrict` | 子が存在すると親を削除不可（デフォルト） | カテゴリーと商品など |
| `cascade` | 親を削除すると子も削除 | 注文と注文明細など |
| `set null` | 親を削除すると子の外部キーを NULL に | ユーザーとコメントなど |

> `set null` を使う場合は対象カラムに `->nullable()` が必要。

**マイグレーションの実行順序：** 参照先テーブル（categories）を参照元（products）より先に作成する。タイムスタンプが若いファイルが先に実行される。

---

## カラムの追加・変更

```php
// 既存テーブルへのカラム追加（Schema::table を使う）
public function up(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->string('category')->nullable()->after('name');
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->dropColumn('category');
    });
}

// カラム変更（Laravel 11 以降は doctrine/dbal 不要）
$table->text('description')->nullable()->change();
$table->string('name', 100)->change();

// カラムのリネーム
$table->renameColumn('old_name', 'new_name');

// 複数カラムの削除
$table->dropColumn(['category', 'old_price']);
```

---

## シーダー（Seeder）

マスターデータや開発用テストデータをDBに投入する仕組み。

```bash
php artisan make:seeder CategorySeeder
php artisan db:seed                          # DatabaseSeeder を実行
php artisan db:seed --class=CategorySeeder  # 特定シーダーのみ実行
php artisan migrate:fresh --seed            # 全削除 → 再実行 → Seeder（開発中の定番）
```

```php
// database/seeders/CategorySeeder.php
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => '家電', 'created_at' => now(), 'updated_at' => now()],
            ['name' => '食品', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
```

```php
// database/seeders/DatabaseSeeder.php（実行順序を管理）
public function run(): void
{
    $this->call([
        CategorySeeder::class,  // 外部キー参照先を先に実行
        ProductSeeder::class,
    ]);
}
```

> 外部キーがある場合、参照先テーブルへのシーダーを先に `call()` に並べる。

---

## 命名規則

| 目的 | 例 |
|---|---|
| テーブル作成 | `create_products_table` |
| カラム追加 | `add_price_to_products_table` |
| カラム変更 | `modify_description_in_products_table` |
| テーブル削除 | `drop_old_products_table` |

テーブル名は複数形（`products`）、モデル名は単数形（`Product`）が Laravel の規約。

---

## まとめ

| 機能 | 書き方 | 用途 |
|---|---|---|
| テーブル作成 | `Schema::create()` | 新規テーブル |
| テーブル変更 | `Schema::table()` | 既存テーブルへの変更 |
| 外部キー | `foreignId()->constrained()` | テーブル間の整合性保証 |
| データ投入 | `Seeder` + `db:seed` | マスターデータ・テストデータ |
| 開発中の再構築 | `migrate:fresh --seed` | クリーンな状態に戻す |
