<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
            }
            if (empty($order->status) && !empty($order->order_status)) {
                $order->status = $order->order_status;
            }
            if (empty($order->order_status) && !empty($order->status)) {
                $order->order_status = $order->status;
            }
        });

        static::saving(function ($order) {
            if ($order->isDirty('order_status')) {
                $order->status = $order->order_status;
            } elseif ($order->isDirty('status')) {
                $order->order_status = $order->status;
            }
        });
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
