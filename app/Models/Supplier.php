<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'proprietor_name',
        'phone',
        'whatsapp',
        'email',
        'address',
        'country',
        'image',
        'status',
    ];
}
