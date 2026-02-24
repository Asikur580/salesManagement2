<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

class EmployeeDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_id',
        'designation_id',
        'parent_id',
        'employee_id',
        'credit_limit',
        'phone',
        'national_id',
        'blood_group',
        'territory',
        'district',
        'status',
        'login_allowed',
        'image',
        'company_id',
        'department_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }





    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function parent()
    {
        return $this->belongsTo(EmployeeDetail::class, 'parent_id');
    }

    public function subordinates()
    {
        return $this->hasMany(EmployeeDetail::class, 'parent_id');
    }

    /**
     * Get all subordinate IDs recursively, including the current employee ID.
     */
    public function getAllSubordinateIds(): array
    {
        $ids = [$this->id];

        foreach ($this->subordinates as $subordinate) {
            $ids = array_merge($ids, $subordinate->getAllSubordinateIds());
        }

        return $ids;
    }
}
