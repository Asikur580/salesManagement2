<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'is_active',
        'base_salary',
        'join_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_salary' => 'decimal:2',
        'join_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
