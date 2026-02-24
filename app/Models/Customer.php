<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'proprietor_name',
        'phone',
        'email',
        'address_street',
        'address_city',
        'address_state',
        'address_zip_code',
        'employee_id',
        'status',
        'credit_limit',
        'image',
    ];

    public function employee()
    {
        return $this->belongsTo(EmployeeDetail::class, 'employee_id');
    }
}
