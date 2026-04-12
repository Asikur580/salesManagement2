<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'paid_amount',
        'status',
        'order_status',
        'payment_status',
        'payment_method',
        'shipping_address',
        'billing_address',
        'notes',
        'created_by',
        'cancelled_by',
        'cancel_reason',
        'technician_id',
        'source',
    ];

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

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function getDueAmountAttribute()
    {
        return $this->total_amount - $this->paid_amount;
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

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
