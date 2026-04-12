<?php

namespace App\Models;

use App\Models\RestockOrderItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestockOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'supplier_id',
        'status',
        'total_amount',
        'notes',
        'received_at',
        'created_by',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function getDueAmountAttribute()
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(RestockOrderItem::class);
    }

    public function transactions()
    {
        return $this->morphMany(StockTransaction::class, 'reference');
    }
}
