<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'unit_id',
        'name',
        'slug',
        'description',
        'product_type',
        'base_price',
        'cost_price',
        'sku',
        'barcode',
        'is_active',
        'stock',
        'low_stock_alert',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function getPriceAttribute()
    {
        // decimal:2 cast makes "0.00" truthy as a string, so cast to float
        if ((float) $this->base_price > 0) {
            return $this->base_price;
        }

        // For variant-only products, return the minimum variant price
        $variants = $this->relationLoaded('variants')
            ? $this->relations['variants']
            : $this->variants()->get();

        if ($variants && $variants->count() > 0) {
            $minPrice = $variants->min(fn($v) => (float) $v->price);
            return $minPrice > 0 ? $minPrice : 0;
        }

        return 0;
    }

    public function getOldPriceAttribute()
    {
        $basePrice = (float) $this->base_price;

        if ($basePrice <= 0) {
            // Use min variant price as the base
            $variants = $this->relationLoaded('variants')
                ? $this->relations['variants']
                : $this->variants()->get();

            if ($variants && $variants->count() > 0) {
                $basePrice = $variants->min(fn($v) => (float) $v->price);
            }
        }

        return $basePrice > 0 ? round($basePrice * 1.15, 2) : null;
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function getIsLowStockAttribute()
    {
        if ($this->low_stock_alert === null) {
            return false;
        }
        return $this->stock <= $this->low_stock_alert;
    }

    public function transactions()
    {
        return $this->hasMany(StockTransaction::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function restockOrderItems()
    {
        return $this->hasMany(RestockOrderItem::class);
    }
}
