<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'barcode',
        'price',
        'cost_price',
        'stock',
        'low_stock_alert',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'low_stock_alert' => 'integer',
    ];

    public function getProfitAttribute()
    {
        return $this->price - $this->cost_price;
    }

    public function getIsLowStockAttribute()
    {
        if ($this->low_stock_alert === null) {
            return false;
        }
        return $this->stock <= $this->low_stock_alert;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributeValues() // fixed camelCase
    {
        return $this->belongsToMany(AttributeValue::class, 'product_variant_attribute_values');
    }

    public function images()
    {
        return $this->hasMany(VariantImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(VariantImage::class)->where('is_primary', true);
    }
}
