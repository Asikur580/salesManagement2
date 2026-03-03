<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'type',
        'order_date',
        'payment_method',
        'subtotal',
        'discount',
        'discount_type',
        'discount_amount',
        'total_amount',
        'status',
        'note',
        'created_by',
        'approved_by',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
