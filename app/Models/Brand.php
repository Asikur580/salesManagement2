<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'image',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = \Illuminate\Support\Str::slug($brand->name);
            }
        });
    }
}
